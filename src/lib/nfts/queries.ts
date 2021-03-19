import { Buffer } from 'buffer';
import Joi from 'joi';
import { SystemWithToolkit, SystemWithWallet } from '../system';
import select from '../util/selectObjectByKeys';
import { ipfsUriToCid } from '../util/ipfs';
import { Collection } from '../../reducer/slices/collections';

function fromHexString(input: string) {
  if (/^([A-Fa-f0-9]{2})*$/.test(input)) {
    return Buffer.from(input, 'hex').toString();
  }
  return input;
}

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
  metadata: Record<string, string>;
  sale?: NftSale;
}

export async function getContractNfts(
  system: SystemWithToolkit | SystemWithWallet,
  collection: Collection | AssetContract,
  purge: boolean = false
): Promise<Nft[]> {
  const ledgerBigMapId = collection.ledgerId;

  if (ledgerBigMapId === undefined || ledgerBigMapId === null) return [];

  const tokensBigMapId = collection.tokensId;

  if (tokensBigMapId === undefined || ledgerBigMapId === null) return [];

  const [ledger, tokens] = await Promise.all([
    system.betterCallDev.getBigMapKeys(
      ledgerBigMapId,
      purge ? 0 : 'tokens' in collection ? collection.tokens?.length : 0
    ),
    system.betterCallDev.getBigMapKeys(
      tokensBigMapId,
      purge ? 0 : 'tokens' in collection ? collection.tokens?.length : 0
    )
  ]);

  // get tokens listed for sale
  const fixedPriceStorage = await system.betterCallDev.getContractStorage(
    system.config.contracts.marketplace.fixedPrice.tez
  );

  const fixedPriceBigMapId = select(fixedPriceStorage, {
    type: 'big_map'
  })?.value;

  const fixedPriceSales = await system.betterCallDev.getBigMapKeys(
    fixedPriceBigMapId
  );

  return Promise.all<Nft>(
    tokens.map(
      async (token: any): Promise<Nft> => {
        const tokenId = select(token, { name: 'token_id' })?.value;
        const metadataMap = select(token, { name: 'token_info' })?.children;
        let metadata = metadataMap.reduce((acc: any, next: any) => {
          return { ...acc, [next.name]: fromHexString(next.value) };
        }, {});

        if (ipfsUriToCid(metadata['""'])) {
          const resolvedMetadata = await system.resolveMetadata(metadata['""']);
          metadata = { ...metadata, ...resolvedMetadata.metadata };
        } else if (ipfsUriToCid(metadata[''])) {
          const resolvedMetadata = await system.resolveMetadata(metadata['']);
          metadata = { ...metadata, ...resolvedMetadata.metadata };
        }

        const entry = ledger.filter((v: any) => v.data.key.value === tokenId);
        const owner = select(entry, { type: 'address' })?.value;

        const saleData = fixedPriceSales.filter((v: any) => {
          return (
            select(v, { name: 'token_for_sale_address' })?.value ===
              collection.address &&
            select(v, { name: 'token_for_sale_token_id' })?.value === tokenId
          );
        });

        let sale = undefined;
        if (saleData.length > 0 && saleData[0].data.value) {
          sale = {
            seller: select(saleData, { name: 'sale_seller' })?.value,
            price: Number.parseInt(saleData[0].data.value.value, 10) / 1000000,
            mutez: Number.parseInt(saleData[0].data.value.value, 10),
            type: 'fixedPrice'
          };
        }

        return {
          id: parseInt(tokenId, 10),
          title: metadata.name,
          owner,
          description: metadata.description,
          artifactUri: metadata.artifactUri,
          metadata: metadata,
          sale: sale
        };
      }
    )
  ).then(tokens =>
    'tokens' in collection
      ? [...(purge ? [] : collection.tokens || []), ...tokens]
      : tokens
  );
}

export interface AssetContract {
  address: string;
  metadata: Record<string, any>;
  ledgerId: number;
  tokensId: number;
}

const metadataSchema = Joi.object({
  name: Joi.string().required().disallow(null)
});

export async function getNftAssetContract(
  system: SystemWithToolkit | SystemWithWallet,
  address: string
): Promise<AssetContract> {
  const bcd = system.betterCallDev;
  const storage = await bcd.getContractStorage(address);

  const metadataBigMapId = select(storage, {
    type: 'big_map',
    name: 'metadata'
  })?.value;

  const ledgerId = select(storage, {
    type: 'big_map',
    name: 'ledger'
  })?.value;

  const tokensId = select(storage, {
    type: 'big_map',
    name: 'token_metadata'
  })?.value;

  const metaBigMap = await system.betterCallDev.getBigMapKeys(metadataBigMapId);
  const metaUri = select(metaBigMap, { key_string: '' })?.value.value;
  const { metadata } = await system.resolveMetadata(fromHexString(metaUri));

  const { error } = metadataSchema.validate(metadata, { allowUnknown: true });
  if (error) {
    throw Error('Metadata validation failed');
  }
  return { address, metadata, ledgerId, tokensId };
}

export async function getWalletNftAssetContracts(system: SystemWithWallet) {
  const bcd = system.betterCallDev;

  let response;
  const results = [];
  do {
    response = await bcd.getWalletContracts(system.tzPublicKey, results.length);
    results.push(
      ...response.items
        .filter(
          (i: any) =>
            Object.keys(i.body).includes('tags') &&
            i.body.tags.includes('fa2') &&
            Object.keys(i.body).includes('entrypoints') &&
            i.body.entrypoints.includes('balance_of') &&
            i.body.entrypoints.includes('mint') &&
            i.body.entrypoints.includes('transfer') &&
            i.body.entrypoints.includes('update_operators')
        )
        .map((assetContract: any) =>
          getNftAssetContract(system, assetContract.value).catch(console.error)
        )
    );
  } while (response.count !== results.length);

  return await Promise.all(results);
}
