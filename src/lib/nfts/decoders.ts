/* eslint-disable no-redeclare */
import * as t from 'io-ts';

// Contracts

export const ContractRow = <S extends t.Mixed>(storage: S) =>
  t.type({
    type: t.string,
    kind: t.string,
    tzips: t.union([t.array(t.string), t.undefined]),
    address: t.string,
    balance: t.number,
    creator: t.type({
      address: t.string
    }),
    numContracts: t.number,
    numDelegations: t.number,
    numOriginations: t.number,
    numTransactions: t.number,
    numReveals: t.number,
    numMigrations: t.number,
    firstActivity: t.number,
    firstActivityTime: t.string,
    lastActivity: t.number,
    lastActivityTime: t.string,
    storage: storage
  });

// Generic BigMaps

export const BigMapRow = <K extends t.Mixed, V extends t.Mixed>(props: {
  key: K;
  value: V;
}) =>
  t.type({
    id: t.number,
    active: t.boolean,
    hash: t.string,
    key: props.key,
    value: props.value,
    firstLevel: t.number,
    lastLevel: t.number,
    updates: t.number
  });

export const BigMapUpdateRow = <K extends t.Mixed, V extends t.Mixed>(content: {
  key: K;
  value: V;
}) =>
  t.type({
    id: t.number,
    level: t.number,
    timestamp: t.string,
    bigmap: t.number,
    contract: t.intersection([
      t.partial({ alias: t.string }),
      t.type({ address: t.string })
    ]),
    path: t.string,
    action: t.string,
    content: t.type({ hash: t.string, key: content.key, value: content.value })
  });

// FA2 BigMaps

export type AssetMetadataBigMap = t.TypeOf<typeof AssetMetadataBigMap>;
export const AssetMetadataBigMap = t.array(
  BigMapRow({ key: t.string, value: t.string })
);

export type LedgerBigMap = t.TypeOf<typeof LedgerBigMap>;
export const LedgerBigMap = t.array(
  BigMapRow({ key: t.string, value: t.string })
);

export type TokenMetadataBigMap = t.TypeOf<typeof TokenMetadataBigMap>;
export const TokenMetadataBigMap = t.array(
  BigMapRow({
    key: t.string,
    value: t.type({
      token_id: t.string,
      token_info: t.type({
        '': t.string
      })
    })
  })
);

// FixedPriceSale BigMaps

export type FixedPriceSaleBigMap = t.TypeOf<typeof FixedPriceSaleBigMap>;
export const FixedPriceSaleBigMap = t.array(
  BigMapRow({
    key: t.type({
      sale_token: t.type({
        token_for_sale_address: t.string,
        token_for_sale_token_id: t.string
      }),
      sale_seller: t.string
    }),
    value: t.string
  })
);

// NFT Metadata

export type NftMetadataFormat = t.TypeOf<typeof NftMetadataFormat>;
export const NftMetadataFormat = t.partial({
  uri: t.string,
  hash: t.string,
  mimeType: t.string,
  fileSize: t.number,
  fileName: t.string,
  duration: t.string,
  dimensions: t.partial({
    value: t.string,
    unit: t.string
  }),
  dataRate: t.partial({
    value: t.number,
    unit: t.string
  })
});

export type NftMetadataAttribute = t.TypeOf<typeof NftMetadataAttribute>;
export const NftMetadataAttribute = t.intersection([
  t.type({ name: t.string, value: t.string }),
  t.partial({ type: t.string })
]);

export type NftMetadata = t.TypeOf<typeof NftMetadata>;
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

export type NftSale = t.TypeOf<typeof NftSale>;
export const NftSale = t.type({
  id: t.number,
  seller: t.string,
  price: t.number,
  mutez: t.number,
  type: t.string
});

export type Nft = t.TypeOf<typeof Nft>;
export const Nft = t.intersection([
  t.type({
    id: t.number,
    title: t.string,
    owner: t.string,
    description: t.string,
    artifactUri: t.string,
    metadata: NftMetadata
  }),
  t.partial({
    sale: NftSale,
    address: t.string
  })
]);

// Contract Metadata

export type AssetContract = t.TypeOf<typeof AssetContract>;
export const AssetContract = t.type({
  address: t.string,
  metadata: t.type({
    name: t.string
  })
});
