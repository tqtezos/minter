import { Buffer } from 'buffer';
import Joi from 'joi';
import { SystemWithToolkit, SystemWithWallet } from '../system';
import select from '../util/selectObjectByKeys';
import { ipfsUriToCid } from '../util/ipfs';
import { ContractAbstraction } from '@taquito/taquito';
import { tzip12 } from '@taquito/tzip12';

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
  metadata: NftMetadata;
  sale?: NftSale;
  address?: string;
}

const contractCache: Record<string, any> = {};

export async function getMarketplaceNfts(
  system: SystemWithToolkit | SystemWithWallet,
  address: string
): Promise<Nft[]> {
  const storage = await system.betterCallDev.getContractStorage(address);
  const bigMapId = select(storage, {
    type: 'big_map'
  })?.value;
  const tokenSales = await system.betterCallDev.getBigMapKeys(bigMapId);
  const activeSales = tokenSales.filter((v: any) => {
    return v.data.value;
  });

  return Promise.all(
    activeSales.map(
      async (tokenSale: any): Promise<Nft> => {
        const saleAddress = select(tokenSale, { name: 'token_for_sale_address' })?.value;
        const tokenId = parseInt(select(tokenSale, { name: 'token_for_sale_token_id' })?.value, 10);
        const sale = {
          seller: select(tokenSale, { name: 'sale_seller' })?.value,
          price: Number.parseInt(tokenSale.data.value?.value || 0, 10) / 1000000,
          mutez: Number.parseInt(tokenSale.data.value?.value || 0, 10),
          type: 'fixedPrice'
        };

        if (!(contractCache[saleAddress] instanceof ContractAbstraction)) {
          contractCache[saleAddress] = await system.toolkit.contract.at(saleAddress, tzip12);
        }

        const metadata = await contractCache[saleAddress].tzip12().getTokenMetadata(tokenId);

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

export class NftMetadata {
  [index: string]:
  | string
  | undefined
  | number
  | Array<String | NftMetadataFormat | NftMetadataAttribute>
  | boolean;
  ''?: string;
  name?: string;
  minter?: string;
  symbol?: string;
  decimals?: number;
  rightUri?: string;
  artifactUri?: string;
  displayUri?: string;
  thumbnailUri?: string;
  externalUri?: string;
  description?: string;
  creators?: Array<string>;
  contributors?: Array<string>;
  publishers?: Array<string>;
  date?: string;
  blocklevel?: number;
  type?: string;
  tags?: Array<string>;
  genres?: Array<string>;
  language?: string;
  identifier?: string;
  rights?: string;
  isTransferable?: boolean;
  isBooleanAmount?: boolean;
  shouldPreferSymbol?: boolean;
  formats?: Array<NftMetadataFormat>;
  attributes?: Array<NftMetadataAttribute>;

  constructor(
    root?: string,
    name?: string,
    minter?: string,
    symbol?: string,
    decimals?: number,
    rightUri?: string,
    artifactUri?: string,
    displayUri?: string,
    thumbnailUri?: string,
    externalUri?: string,
    description?: string,
    creators?: Array<string>,
    contributors?: Array<string>,
    publishers?: Array<string>,
    date?: string,
    blocklevel?: number,
    type?: string,
    tags?: Array<string>,
    genres?: Array<string>,
    language?: string,
    identifier?: string,
    rights?: string,
    isTransferable?: boolean,
    isBooleanAmount?: boolean,
    shouldPreferSymbol?: boolean,
    formats?: Array<NftMetadataFormat>,
    attributes?: Array<NftMetadataAttribute>
  ) {
    this[''] = root;
    this.name = name;
    this.minter = minter;
    this.symbol = symbol;
    this.decimals = decimals;
    this.rightUri = rightUri;
    this.artifactUri = artifactUri;
    this.displayUri = displayUri;
    this.thumbnailUri = thumbnailUri;
    this.externalUri = externalUri;
    this.description = description;
    this.creators = creators;
    this.contributors = contributors;
    this.publishers = publishers;
    this.date = date;
    this.blocklevel = blocklevel;
    this.type = type;
    this.tags = tags;
    this.genres = genres;
    this.language = language;
    this.identifier = identifier;
    this.rights = rights;
    this.isTransferable = isTransferable;
    this.isBooleanAmount = isBooleanAmount;
    this.shouldPreferSymbol = shouldPreferSymbol;
    this.formats = formats;
    this.attributes = attributes;
  }
}

export interface NftMetadataFormat {
  uri: string;
  hash: string;
  mimeType: string;
  fileSize: number;
  fileName: string;
  duration: string;
  dimensions: NtfMetadataFormatDimensions;
  dataRate: NtfMetadataFormatDataRate;
}

export interface NtfMetadataFormatDataRate {
  value: number;
  unit: string;
}
export interface NtfMetadataFormatDimensions {
  value: string;
  unit: string;
}

export interface NftMetadataAttribute {
  name: string | null;
  value: string | null;
  type?: string;
}

export async function getContractNfts(
  system: SystemWithToolkit | SystemWithWallet,
  address: string
): Promise<Nft[]> {
  const storage = await system.betterCallDev.getContractStorage(address);

  const ledgerBigMapId = select(storage, {
    type: 'big_map',
    name: 'ledger'
  })?.value;

  if (ledgerBigMapId === undefined || ledgerBigMapId === null) return [];

  const tokensBigMapId = select(storage, {
    type: 'big_map',
    name: 'token_metadata'
  })?.value;

  if (tokensBigMapId === undefined || ledgerBigMapId === null) return [];

  const ledger = await system.betterCallDev.getBigMapKeys(ledgerBigMapId);

  if (!ledger) return [];

  const tokens = await system.betterCallDev.getBigMapKeys(tokensBigMapId);

  if (!tokens) return [];

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

  return Promise.all(
    tokens.map(
      async (token: any): Promise<Nft> => {
        const tokenId = select(token, { name: 'token_id' })?.value;
        const metadataMap = select(token, { name: 'token_info' })?.children;
        let metadata = metadataMap.reduce((acc: any, next: any) => {
          return { ...acc, [next.name]: fromHexString(next.value) };
        }, {});

        if (ipfsUriToCid(metadata['""']) || ipfsUriToCid(metadata[''])) {
          const resolvedMetadata = await system.resolveMetadata(metadata['""'] ?? metadata['']);
          metadata = { ...metadata, ...resolvedMetadata.metadata };
        }

        const entry = ledger.filter((v: any) => v.data.key.value === tokenId);
        const owner = select(entry, { type: 'address' })?.value;

        const saleData = fixedPriceSales.filter((v: any) => {
          return (
            select(v, { name: 'token_for_sale_address' })?.value === address &&
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

  const metaBigMap = await system.betterCallDev.getBigMapKeys(metadataBigMapId);
  const metaUri = select(metaBigMap, { key_string: '' })?.value.value;
  const { metadata } = await system.resolveMetadata(fromHexString(metaUri));

  const { error } = metadataSchema.validate(metadata, { allowUnknown: true });
  if (error) {
    throw Error('Metadata validation failed');
  }
  return { address, metadata };
}

export async function getWalletNftAssetContracts(system: SystemWithWallet) {
  const bcd = system.betterCallDev;
  const response = await bcd.getWalletContracts(system.tzPublicKey);
  const assetContracts = response.items.filter(
    (i: any) =>
      Object.keys(i.body).includes('tags') &&
      i.body.tags.includes('fa2') &&
      Object.keys(i.body).includes('entrypoints') &&
      i.body.entrypoints.includes('balance_of') &&
      i.body.entrypoints.includes('mint') &&
      i.body.entrypoints.includes('transfer') &&
      i.body.entrypoints.includes('update_operators')
  );

  const results = [];
  for (let assetContract of assetContracts) {
    try {
      results.push(getNftAssetContract(system, assetContract.value));
    } catch (e) {
      console.log(e);
    }
  }

  return await Promise.all(results);
}
