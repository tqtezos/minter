/* eslint-disable no-redeclare */
import { Buffer } from 'buffer';
import * as t from 'io-ts';
import _ from 'lodash';
import { SystemWithToolkit, SystemWithWallet } from '../system';
import { TzKt, Params } from '../service/tzkt';
import { isLeft } from 'fp-ts/lib/Either';
import { compact } from 'fp-ts/lib/Array';
import { getRight } from 'fp-ts/lib/Option';
import * as D from './decoders';

function fromHexString(input: string) {
  if (/^([A-Fa-f0-9]{2})*$/.test(input)) {
    return Buffer.from(input, 'hex').toString();
  }
  return input;
}

//// Data retrieval and decoding functions

async function getAssetMetadataBigMap(
  tzkt: TzKt,
  address: string
): Promise<D.AssetMetadataBigMap> {
  const path = 'metadata';
  const data = await tzkt.getContractBigMapKeys(address, path);
  const decoded = D.LedgerBigMap.decode(data);
  if (isLeft(decoded)) {
    throw Error('Failed to decode `getAssetMetadata` response');
  }
  return decoded.right;
}

async function getLedgerBigMap(
  tzkt: TzKt,
  address: string
): Promise<D.LedgerBigMap> {
  const path = 'assets.ledger';
  const data = await tzkt.getContractBigMapKeys(address, path);
  const decoded = D.LedgerBigMap.decode(data);
  if (isLeft(decoded)) {
    throw Error('Failed to decode `getLedger` response');
  }
  return decoded.right;
}

async function getTokenMetadataBigMap(
  tzkt: TzKt,
  address: string
): Promise<D.TokenMetadataBigMap> {
  const path = 'assets.token_metadata';
  const data = await tzkt.getContractBigMapKeys(address, path);
  const decoded = D.TokenMetadataBigMap.decode(data);
  if (isLeft(decoded)) {
    throw Error('Failed to decode `getTokenMetadata` response');
  }
  return decoded.right;
}

function transformFixedPriceSales(fixedPriceSales: any): t.Mixed[] {
  fixedPriceSales.forEach((fixedPriceSale: any, i: number) => {
    if (fixedPriceSale.key.hasOwnProperty('seller')) {
      fixedPriceSales[i].key['sale_seller'] = fixedPriceSale.key.seller;
      delete fixedPriceSales[i].key.seller;
    }
  });
  return fixedPriceSales;
}

async function getFixedPriceSalesBigMap(
  tzkt: TzKt,
  address: string
): Promise<D.FixedPriceSaleBigMap> {
  let fixedPriceBigMapId;
  const fixedPriceStorage = await tzkt.getContractStorage(address);
  if (fixedPriceStorage.hasOwnProperty('sales')) {
    fixedPriceBigMapId = fixedPriceStorage.sales;
  } else {
    fixedPriceBigMapId = fixedPriceStorage; // legacy marketplace contract
  }
  if (isLeft(t.number.decode(fixedPriceBigMapId))) {
    throw Error('Failed to decode `getFixedPriceSales` bigMap ID');
  }
  const fixedPriceSales = transformFixedPriceSales(await tzkt.getBigMapKeys(fixedPriceBigMapId));
  const decoded = D.FixedPriceSaleBigMap.decode(fixedPriceSales);
  if (isLeft(decoded)) {
    throw Error('Failed to decode `getFixedPriceSales` response');
  }
  return decoded.right;
}

async function getBigMapUpdates<K extends t.Mixed, V extends t.Mixed>(
  tzkt: TzKt,
  params: Params,
  content: { key: K; value: V }
) {
  const bigMapUpdates = await tzkt.getBigMapUpdates(params);
  const decoder = t.array(D.BigMapUpdateRow(content));
  const decoded = decoder.decode(bigMapUpdates);
  if (isLeft(decoded)) {
    throw Error('Failed to decode `getBigMapUpdates` response');
  }
  return decoded.right;
}

async function getContracts<S extends t.Mixed>(
  tzkt: TzKt,
  params: Params,
  storage: S
) {
  const contracts = await tzkt.getContracts(params);
  const contractsArray = t.array(t.unknown).decode(contracts);
  if (isLeft(contractsArray)) {
    throw Error('Failed to decode `getContracts` response');
  }
  const decodedArray = contractsArray.right.map(D.ContractRow(storage).decode);
  return compact(decodedArray.map(getRight));
}

async function getContract<S extends t.Mixed>(
  tzkt: TzKt,
  address: string,
  params: Params,
  storage: S
) {
  const contract = await tzkt.getContract(address, params);
  const decoded = D.ContractRow(storage).decode(contract);
  if (isLeft(decoded)) {
    throw Error('Failed to decode `getContracts` response');
  }
  return decoded.right;
}

//// Main query functions

export async function getContractNfts(
  system: SystemWithToolkit | SystemWithWallet,
  address: string
): Promise<D.Nft[]> {
  const ledger = await getLedgerBigMap(system.tzkt, address);
  const tokens = await getTokenMetadataBigMap(system.tzkt, address);
  const mktAddress = system.config.contracts.marketplace.fixedPrice.tez;
  const tokenSales = await getFixedPriceSalesBigMap(system.tzkt, mktAddress);
  const activeSales = tokenSales.filter(sale => sale.active);

  return Promise.all(
    tokens.map(
      async (token): Promise<D.Nft> => {
        const { token_id: tokenId, token_info: tokenInfo } = token.value;

        // TODO: Write decoder function for data retrieval
        const decodedInfo = _.mapValues(tokenInfo, fromHexString) as any;
        const resolvedInfo = await system.resolveMetadata(
          decodedInfo[''],
          address
        );
        const metadata = { ...decodedInfo, ...resolvedInfo.metadata };

        const saleData = activeSales.find(
          v =>
            v.key.sale_token.token_for_sale_address === address &&
            v.key.sale_token.token_for_sale_token_id === tokenId
        );

        const sale = saleData && {
          id: saleData.id,
          seller: saleData.key.sale_seller,
          price: Number.parseInt(saleData.value, 10) / 1000000,
          mutez: Number.parseInt(saleData.value, 10),
          type: 'fixedPrice'
        };

        return {
          id: parseInt(tokenId, 10),
          owner: ledger.find(e => e.key === tokenId)?.value!,
          title: metadata.name,
          description: metadata.description,
          artifactUri: metadata.artifactUri,
          metadata: metadata,
          sale
        };
      }
    )
  );
}

export async function getNftAssetContract(
  system: SystemWithToolkit | SystemWithWallet,
  address: string
): Promise<D.AssetContract> {
  const contract = await getContract(system.tzkt, address, {}, t.unknown);
  const metaBigMap = await getAssetMetadataBigMap(system.tzkt, address);
  const metaUri = metaBigMap.find(v => v.key === '')?.value;
  if (!metaUri) {
    throw Error(`Could not extract metadata URI from ${address} storage`);
  }

  const { metadata } = await system.resolveMetadata(
    fromHexString(metaUri),
    address
  );
  const decoded = D.AssetContractMetadata.decode(metadata);

  if (isLeft(decoded)) {
    throw Error('Metadata validation failed');
  }
  return { ...contract, metadata: decoded.right };
}

export async function getWalletNftAssetContracts(
  system: SystemWithWallet
): Promise<D.AssetContract[]> {
  return await getNftAssetContracts(system, system.tzPublicKey);
};

export async function getNftAssetContracts(
  system: SystemWithWallet,
  tzPublicKey: string
): Promise<D.AssetContract[]> {
  const contracts = await getContracts(
    system.tzkt,
    {
      creator: tzPublicKey,
      includeStorage: 'true'
    },
    t.unknown
  );

  const addresses = _.uniq(
    contracts
      .filter(c => c.kind === 'asset' && c.tzips?.includes('fa2'))
      .map(c => c.address)
  );

  const results: D.AssetContract[] = [];

  if (addresses.length === 0) {
    return results;
  }

  const assetBigMapRows = (
    await getBigMapUpdates(
      system.tzkt,
      {
        path: 'metadata',
        action: 'add_key',
        'contract.in': addresses.join(','),
        limit: '10000'
      },
      {
        key: t.string,
        value: t.string
      }
    )
  ).filter(v => v.content.key === '');

  for (const row of assetBigMapRows) {
    const contract = contracts.find(c => c.address === row.contract.address);
    if (!contract) {
      continue;
    }
    try {
      const metaUri = row.content.value;
      const { metadata } = await system.resolveMetadata(
        fromHexString(metaUri),
        contract.address
      );
      const decoded = D.AssetContractMetadata.decode(metadata);
      if (!isLeft(decoded)) {
        results.push({ ...contract, metadata: decoded.right });
      }
    } catch (e) {
      console.log(e);
    }
  }

  return results;
}

export type MarketplaceNftLoadingData = {
  loaded: boolean;
  error?: string;
  token: null | D.Nft;
  tokenSale: D.FixedPriceSaleBigMap[number];
  tokenMetadata: undefined | string;
};

export async function getMarketplaceNfts(
  system: SystemWithToolkit | SystemWithWallet,
  address: string
): Promise<MarketplaceNftLoadingData[]> {
  const tokenSales = await getFixedPriceSalesBigMap(system.tzkt, address);
  const activeSales = tokenSales.filter(v => v.active);
  const addresses = _.uniq(
    activeSales.map(s => s.key.sale_token.token_for_sale_address)
  );

  const uniqueAddresses = Array.from(new Set(addresses));

  if (uniqueAddresses.length === 0) {
    return [];
  }

  const tokenBigMapRows = await getBigMapUpdates(
    system.tzkt,
    {
      path: 'assets.token_metadata',
      action: 'add_key',
      'contract.in': addresses.join(','),
      limit: '10000'
    },
    {
      key: t.string,
      value: t.type({
        token_id: t.string,
        token_info: t.record(t.string, t.string)
      })
    }
  );

  // Sort descending (newest first)
  const salesToView = [...activeSales].reverse();
  const salesWithTokenMetadata = salesToView
    .map(x => ({
      tokenSale: x,
      tokenItem: tokenBigMapRows.find(
        item =>
          x.key.sale_token.token_for_sale_address === item.contract.address &&
          x.key.sale_token.token_for_sale_token_id ===
            item.content.value.token_id + ''
      )
    }))
    .map(x => ({
      loaded: false,
      token: null,
      tokenSale: x.tokenSale,
      tokenMetadata: x.tokenItem?.content?.value?.token_info['']
    }));

  return salesWithTokenMetadata;
}

export const loadMarketplaceNft = async (
  system: SystemWithToolkit | SystemWithWallet,
  tokenLoadData: MarketplaceNftLoadingData
): Promise<MarketplaceNftLoadingData> => {
  const { token, loaded, tokenSale, tokenMetadata } = tokenLoadData;
  const result = { ...tokenLoadData };

  if (token || loaded) {
    return result;
  }
  result.loaded = true;

  try {
    const {
      token_for_sale_address: saleAddress,
      token_for_sale_token_id: tokenIdStr
    } = tokenSale.key.sale_token;

    const tokenId = parseInt(tokenIdStr, 10);
    const mutez = Number.parseInt(tokenSale.value, 10);
    const sale = {
      id: tokenSale.id,
      seller: tokenSale.key.sale_seller,
      price: mutez / 1000000,
      mutez: mutez,
      type: 'fixedPrice'
    };

    if (!tokenMetadata) {
      result.error = "Couldn't retrieve tokenMetadata";
      console.error("Couldn't retrieve tokenMetadata", { tokenSale });
      return result;
    }

    const { metadata } = (await system.resolveMetadata(
      fromHexString(tokenMetadata),
      saleAddress
    )) as any;

    result.token = {
      address: saleAddress,
      id: tokenId,
      title: metadata.name || '',
      owner: sale.seller,
      description: metadata.description || '',
      artifactUri: metadata.artifactUri || '',
      metadata: metadata,
      sale: sale
    };

    return result;
  } catch (err) {
    result.error = "Couldn't load token";
    console.error("Couldn't load token", { tokenSale, err });
    return result;
  }
};
