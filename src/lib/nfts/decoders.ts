/* eslint-disable no-redeclare */
import * as t from 'io-ts';
import * as e from 'fp-ts/Either';
import merge from "ts-deepmerge";

//// Contracts

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

//// Generic BigMaps

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

//// FA2 BigMaps

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

//// FixedPriceSale BigMaps

function sequenceCodecs<A, B, O, P, H, I>(
  inputCodec: t.Type<A, O, H>,
  transform: (decoded: A) => I,
  outputCodec: t.Type<B, P, I>,
  name: string = outputCodec.name
): t.Type<B, P, H> {
  return new t.Type(
    name,
    outputCodec.is,
    (input, context) =>
      e.chain((decoded: A) => {
        return outputCodec.validate(transform(decoded), context);
      })(inputCodec.validate(input, context)),
    outputCodec.encode
  );
}

// Compatibility: Some fixed_price_sale contract bigmaps use a `sale_seller`
// field while others use a `seller` field. This decoder conforms all bigmaps
// to use the `sale_seller` field. The decoder receives an "input" codec that
// describes the `sale_seller` and `seller` fields as optional strings. This
// initial validation allows us to reference these (possibly undefined) fields
// and pass them to the "output" codec for validation via a transformation
// function.
//
// In this case the transformation defines the `sale_seller` field as one of the
// two input fields. Note the resulting field could be undefined; however, the
// "output" codec will fail if this is the case.

export type FixedPriceSaleBigMapKey = t.TypeOf<typeof FixedPriceSaleBigMapKey>;
const legacySaleV1 = t.type({
    sale_seller: t.string,
    sale_token: t.type({
      token_for_sale_address: t.string,
      token_for_sale_token_id: t.string
    })
  });
const legacySaleV2 = t.type({
    seller: t.string,
    sale_token: t.type({
      token_for_sale_address: t.string,
      token_for_sale_token_id: t.string
    })
  });
const saleV3 = t.type({
  sale_data: t.type({
    amount: t.string,
    price: t.string,
    sale_token: t.type({
      fa2_address: t.string,
      token_id: t.string
    }),
  }),
  seller: t.string
});
const sale = t.intersection([
  saleV3,
  t.partial({ isLegacy: t.boolean })
]);

export const FixedPriceSaleBigMapKey = sequenceCodecs(
  t.union([ legacySaleV1, legacySaleV2, saleV3 ]),
  decoded => ({
    ...decoded,
    sale_data: saleV3.is(decoded) ? decoded.sale_data : {
      amount: "1",
      price: "0",
      sale_token: {
        fa2_address: decoded.sale_token.token_for_sale_address,
        token_id: decoded.sale_token.token_for_sale_token_id
      }
    },
    seller: (saleV3.is(decoded) || legacySaleV2.is(decoded)) ? decoded.seller : decoded.sale_seller
  }),
  sale
);

const FixedPriceSaleBigMapRowV1 = BigMapRow({
  key: FixedPriceSaleBigMapKey,
  value: t.string
});

const FixedPriceSaleBigMapRowV2 = BigMapRow({
  key: t.string,
  value: FixedPriceSaleBigMapKey
});

export type FixedPriceSaleBigMap = t.TypeOf<typeof FixedPriceSaleBigMap>;
export const FixedPriceSaleBigMap = t.array(sequenceCodecs(
  t.union([ FixedPriceSaleBigMapRowV1, FixedPriceSaleBigMapRowV2 ]),
  row => (FixedPriceSaleBigMapRowV1.is(row) ? merge(
      row,
      { key: row.id.toString(), value: row.key },
      { value: { isLegacy: true, sale_data: { price: row.value }}}
    ) : merge(row, { value: { isLegacy: false }})
  ),
  FixedPriceSaleBigMapRowV2
));

// Compatibility: fixed_price_sale contracts may have different storage
// depending on which version was originated. Older versions only contain a
// number referencing a `sales` bigmap, while newer versions store this number
// in a `sales` field. For example:
//   Legacy version:
//     42
//   Current version:
//     { sales: 42 }
//
// This decoder conforms both storage schemas into the current version.

export type FixedPriceSaleStorage = t.TypeOf<typeof FixedPriceSaleStorage>;
export const FixedPriceSaleStorage = sequenceCodecs(
  t.union([t.number, t.type({ sales: t.number })]),
  sales => (t.number.is(sales) ? { sales } : sales),
  t.type({ sales: t.number })
);

//// NFT Metadata

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
  type: t.string,
  saleToken: t.type({
    address: t.string,
    tokenId: t.number
  }),
  saleId: t.number
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

//// Contract Metadata

export const AssetContractMetadata = t.type({
  name: t.string
});

export type AssetContract = t.TypeOf<typeof AssetContract>;
export const AssetContract = t.intersection([
  ContractRow(t.unknown),
  t.type({
    metadata: AssetContractMetadata
  })
]);
