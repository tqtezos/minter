/* eslint-disable no-redeclare */
import { Buffer } from 'buffer';
import * as t from 'io-ts';
import _ from 'lodash';
import { SystemWithToolkit, SystemWithWallet } from '../system';
import select from '../util/selectObjectByKeys';
import { ContractAbstraction } from '@taquito/taquito';
import { tzip12 } from '@taquito/tzip12';
import { TzKt } from '../service/tzkt';
import { isLeft } from 'fp-ts/lib/Either';

export type AssetMetadataResponse = t.TypeOf<typeof AssetMetadataResponse>;
export const AssetMetadataResponse = t.array(
  t.type({
    id: t.number,
    active: t.boolean,
    hash: t.string,
    key: t.string,
    value: t.string,
    firstLevel: t.number,
    lastLevel: t.number,
    updates: t.number
  })
);

export type LedgerResponse = t.TypeOf<typeof LedgerResponse>;
export const LedgerResponse = t.array(
  t.type({
    id: t.number,
    active: t.boolean,
    hash: t.string,
    key: t.string,
    value: t.string,
    firstLevel: t.number,
    lastLevel: t.number,
    updates: t.number
  })
);

export type TokenMetadataResponse = t.TypeOf<typeof TokenMetadataResponse>;
export const TokenMetadataResponse = t.array(
  t.type({
    id: t.number,
    active: t.boolean,
    hash: t.string,
    key: t.string,
    value: t.type({
      token_id: t.string,
      token_info: t.type({
        '': t.string
      })
    }),
    firstLevel: t.number,
    lastLevel: t.number,
    updates: t.number
  })
);

export type FixedPriceSaleResponse = t.TypeOf<typeof FixedPriceSaleResponse>;
const FixedPriceSaleResponse = t.array(
  t.type({
    id: t.number,
    active: t.boolean,
    hash: t.string,
    key: t.type({
      sale_token: t.type({
        token_for_sale_address: t.string,
        token_for_sale_token_id: t.string
      }),
      sale_seller: t.string
    }),
    value: t.string,
    firstLevel: t.number,
    lastLevel: t.number,
    updates: t.number
  })
);

export const NftMetadataFormatDimensions = t.partial({
  value: t.string,
  unit: t.string
});

export type NftMetadataFormatDimensions = t.TypeOf<
  typeof NftMetadataFormatDimensions
>;

export const NtfMetadataFormatDataRate = t.partial({
  value: t.number,
  unit: t.string
});

export type NtfMetadataFormatDataRate = t.TypeOf<
  typeof NtfMetadataFormatDataRate
>;

export const NftMetadataFormat = t.partial({
  uri: t.string,
  hash: t.string,
  mimeType: t.string,
  fileSize: t.number,
  fileName: t.string,
  duration: t.string,
  dimensions: NftMetadataFormatDimensions,
  dataRate: NtfMetadataFormatDataRate
});

export type NftMetadataFormat = t.TypeOf<typeof NftMetadataFormat>;

export const NftMetadataAttribute = t.intersection([
  t.type({ name: t.string, value: t.string }),
  t.partial({ type: t.string })
]);

export type NftMetadataAttribute = t.TypeOf<typeof NftMetadataAttribute>;

export const NftMetadata = t.partial({
  '': t.string,
  name: t.string,
  minter: t.string,
  symbol: t.string,
  decimals: t.number,
  rightUri: t.string,
  artifactUri: t.string,
  displayUri: t.string,
  thumbnailUri: t.string,
  externalUri: t.string,
  description: t.string,
  creators: t.array(t.string),
  contributors: t.array(t.string),
  publishers: t.array(t.string),
  date: t.string,
  blocklevel: t.number,
  type: t.string,
  tags: t.array(t.string),
  genres: t.array(t.string),
  language: t.string,
  identifier: t.string,
  rights: t.string,
  isTransferable: t.boolean,
  isBooleanAmount: t.boolean,
  shouldPreferSymbol: t.boolean,
  formats: t.array(NftMetadataFormat),
  attributes: t.array(NftMetadataAttribute)
});

export type NftMetadata = t.TypeOf<typeof NftMetadata>;

interface NftSale {
  seller: string;
  price: number;
  mutez: number;
  type: string;
}

export interface Nft {
  id: number;
  title: string;
  owner: string;
  description: string;
  artifactUri: string;
  metadata: NftMetadata;
  sale?: NftSale;
  address?: string;
}

function fromHexString(input: string) {
  if (/^([A-Fa-f0-9]{2})*$/.test(input)) {
    return Buffer.from(input, 'hex').toString();
  }
  return input;
}

const contractCache: Record<string, any> = {};
const fixedPriceSalesCache: Record<string, FixedPriceSaleResponse> = {};

export async function getMarketplaceNfts(
  system: SystemWithToolkit | SystemWithWallet,
  address: string
): Promise<Nft[]> {
  let tokenSales: FixedPriceSaleResponse;
  if (fixedPriceSalesCache[address]) {
    tokenSales = fixedPriceSalesCache[address];
  } else {
    tokenSales = await getFixedPriceSales(system.tzkt, address);
    fixedPriceSalesCache[address] = tokenSales;
  }
  const activeSales = tokenSales.filter(v => v.active);

  return Promise.all(
    activeSales.map(
      async (tokenSale): Promise<Nft> => {
        const {
          token_for_sale_address: saleAddress,
          token_for_sale_token_id: tokenIdStr
        } = tokenSale.key.sale_token;
        const tokenId = parseInt(tokenIdStr, 10);
        const mutez = Number.parseInt(tokenSale.value, 10);
        const sale = {
          seller: tokenSale.key.sale_seller,
          price: mutez / 1000000,
          mutez: mutez,
          type: 'fixedPrice'
        };

        if (!(contractCache[saleAddress] instanceof ContractAbstraction)) {
          contractCache[saleAddress] = await system.toolkit.contract.at(
            saleAddress,
            tzip12
          );
        }

        const metadata = await contractCache[saleAddress]
          .tzip12()
          .getTokenMetadata(tokenId);

        return {
          address: saleAddress,
          id: tokenId,
          title: metadata.name,
          owner: sale.seller,
          description: metadata.description,
          artifactUri: metadata.artifactUri,
          metadata: metadata,
          sale: sale
        };
      }
    )
  );
}

async function getAssetMetadata(
  tzkt: TzKt,
  address: string
): Promise<AssetMetadataResponse> {
  const path = 'metadata';
  const data = await tzkt.getContractBigMapKeys(address, path);
  const decoded = LedgerResponse.decode(data);
  if (isLeft(decoded)) {
    throw Error('Failed to decode `getAssetMetadata` response');
  }
  return decoded.right;
}

async function getLedger(tzkt: TzKt, address: string): Promise<LedgerResponse> {
  const path = 'assets.ledger';
  const data = await tzkt.getContractBigMapKeys(address, path);
  const decoded = LedgerResponse.decode(data);
  if (isLeft(decoded)) {
    throw Error('Failed to decode `getLedger` response');
  }
  return decoded.right;
}

async function getTokenMetadata(
  tzkt: TzKt,
  address: string
): Promise<TokenMetadataResponse> {
  const path = 'assets.token_metadata';
  const data = await tzkt.getContractBigMapKeys(address, path);
  const decoded = TokenMetadataResponse.decode(data);
  if (isLeft(decoded)) {
    throw Error('Failed to decode `getTokenMetadata` response');
  }
  return decoded.right;
}

async function getFixedPriceSales(
  tzkt: TzKt,
  address: string
): Promise<FixedPriceSaleResponse> {
  const fixedPriceBigMapId = await tzkt.getContractStorage(address);
  if (isLeft(t.number.decode(fixedPriceBigMapId))) {
    throw Error('Failed to decode `getFixedPriceSales` bigMap ID');
  }
  const fixedPriceSales = await tzkt.getBigMapKeys(fixedPriceBigMapId);
  const decoded = FixedPriceSaleResponse.decode(fixedPriceSales);
  if (isLeft(decoded)) {
    throw Error('Failed to decode `getFixedPriceSales` response');
  }
  return decoded.right;
}

export async function getContractNfts(
  system: SystemWithToolkit | SystemWithWallet,
  address: string
): Promise<Nft[]> {
  const ledger = await getLedger(system.tzkt, address);
  const tokens = await getTokenMetadata(system.tzkt, address);
  const mktAddress = system.config.contracts.marketplace.fixedPrice.tez;
  let tokenSales: FixedPriceSaleResponse;
  if (fixedPriceSalesCache[mktAddress]) {
    tokenSales = fixedPriceSalesCache[mktAddress];
  } else {
    tokenSales = await getFixedPriceSales(system.tzkt, mktAddress);
    fixedPriceSalesCache[mktAddress] = tokenSales;
  }

  return Promise.all(
    tokens.map(
      async (token): Promise<any> => {
        const { token_id: tokenId, token_info: tokenInfo } = token.value;

        const decodedInfo = _.mapValues(tokenInfo, fromHexString) as any;
        const resolvedInfo = await system.resolveMetadata(decodedInfo['']);
        const metadata = { ...decodedInfo, ...resolvedInfo.metadata };

        const saleData = tokenSales.find(
          v =>
            v.key.sale_token.token_for_sale_address === address &&
            v.key.sale_token.token_for_sale_token_id === tokenId
        );

        const sale = saleData && {
          seller: saleData.key.sale_seller,
          price: Number.parseInt(saleData.value, 10) / 1000000,
          mutez: Number.parseInt(saleData.value, 10),
          type: 'fixedPrice'
        };

        return {
          id: parseInt(tokenId, 10),
          owner: ledger.find(e => e.key === tokenId),
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

export interface AssetContract {
  address: string;
  metadata: Record<string, any>;
}

const AssetMetadata = t.type({
  name: t.string
});

export async function getNftAssetContract(
  system: SystemWithToolkit | SystemWithWallet,
  address: string
): Promise<AssetContract> {
  const metaBigMap = await getAssetMetadata(system.tzkt, address);
  const metaUri = metaBigMap.find(v => v.key === '')?.value;
  if (!metaUri) {
    throw Error(`Could not extract metadata URI from ${address} storage`);
  }
  const { metadata } = await system.resolveMetadata(fromHexString(metaUri));

  const decoded = AssetMetadata.decode(metadata);
  if (isLeft(decoded)) {
    throw Error('Metadata validation failed');
  }
  return { address, metadata };
}

export async function getWalletNftAssetContracts(system: SystemWithWallet) {
  const response = await system.tzkt.getAccountContracts(system.tzPublicKey);
  const assetContracts = response.filter((v: any) => v.kind === 'asset');

  const results = [];
  for (let assetContract of assetContracts) {
    try {
      const result = await getNftAssetContract(system, assetContract.address);
      results.push(result);
    } catch (e) {
      console.log(e);
    }
  }

  return results;
}
