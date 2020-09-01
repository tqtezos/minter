import gql from 'graphql-tag';
export type Maybe<T> = T | null;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  JSON: any;
};

export type BigMapDiffItem = {
  __typename?: 'BigMapDiffItem';
  key?: Maybe<Scalars['String']>;
  key_hash?: Maybe<Scalars['String']>;
  key_binary?: Maybe<Scalars['String']>;
  value?: Maybe<Scalars['JSON']>;
  meta?: Maybe<BigMapDiffItemMeta>;
  action?: Maybe<Scalars['String']>;
};

export type BigMapDiffItemMeta = {
  __typename?: 'BigMapDiffItemMeta';
  contract?: Maybe<Scalars['String']>;
  bigmap_id?: Maybe<Scalars['Int']>;
  time?: Maybe<Scalars['String']>;
  height?: Maybe<Scalars['Int']>;
  block?: Maybe<Scalars['String']>;
};

export type BigMapKv = {
  __typename?: 'BigMapKV';
  key?: Maybe<Scalars['String']>;
  key_hash?: Maybe<Scalars['String']>;
  key_binary?: Maybe<Scalars['String']>;
  value?: Maybe<Scalars['JSON']>;
  meta?: Maybe<BigMapMeta>;
};

export type BigMapMeta = {
  __typename?: 'BigMapMeta';
  contract?: Maybe<Scalars['String']>;
  bigmap_id?: Maybe<Scalars['Int']>;
  time?: Maybe<Scalars['String']>;
  height?: Maybe<Scalars['Int']>;
  block?: Maybe<Scalars['String']>;
  is_replaced?: Maybe<Scalars['Boolean']>;
  is_removed?: Maybe<Scalars['Boolean']>;
};

export type ContractOperation = {
  __typename?: 'ContractOperation';
  hash?: Maybe<Scalars['String']>;
  type?: Maybe<Scalars['String']>;
  block?: Maybe<Scalars['String']>;
  time?: Maybe<Scalars['String']>;
  height?: Maybe<Scalars['Int']>;
  cycle?: Maybe<Scalars['Int']>;
  counter?: Maybe<Scalars['Int']>;
  op_n?: Maybe<Scalars['Int']>;
  op_c?: Maybe<Scalars['Int']>;
  op_i?: Maybe<Scalars['Int']>;
  status?: Maybe<Scalars['String']>;
  is_success?: Maybe<Scalars['Boolean']>;
  is_contract?: Maybe<Scalars['Boolean']>;
  gas_limit?: Maybe<Scalars['Int']>;
  gas_used?: Maybe<Scalars['Int']>;
  gas_price?: Maybe<Scalars['Float']>;
  storage_limit?: Maybe<Scalars['Int']>;
  storage_size?: Maybe<Scalars['Int']>;
  storage_paid?: Maybe<Scalars['Int']>;
  volume?: Maybe<Scalars['Int']>;
  fee?: Maybe<Scalars['Float']>;
  reward?: Maybe<Scalars['Int']>;
  deposit?: Maybe<Scalars['Int']>;
  burned?: Maybe<Scalars['Int']>;
  is_internal?: Maybe<Scalars['Boolean']>;
  has_data?: Maybe<Scalars['Boolean']>;
  days_destroyed?: Maybe<Scalars['Int']>;
  parameters?: Maybe<ContractOperationParams>;
  storage?: Maybe<ContractOperationStorage>;
  big_map_diff?: Maybe<Array<Maybe<BigMapDiffItem>>>;
  sender?: Maybe<Scalars['String']>;
  receiver?: Maybe<Scalars['String']>;
  branch_id?: Maybe<Scalars['Int']>;
  branch_height?: Maybe<Scalars['Int']>;
  branch_depth?: Maybe<Scalars['Int']>;
  branch?: Maybe<Scalars['String']>;
};

export type ContractOperationParams = {
  __typename?: 'ContractOperationParams';
  entrypoint?: Maybe<Scalars['String']>;
  branch?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['Int']>;
  value?: Maybe<Scalars['JSON']>;
};

export type ContractOperationStorage = {
  __typename?: 'ContractOperationStorage';
  meta?: Maybe<ContractOperationStorageMeta>;
  value?: Maybe<Scalars['JSON']>;
};

export type ContractOperationStorageMeta = {
  __typename?: 'ContractOperationStorageMeta';
  contract?: Maybe<Scalars['String']>;
  time?: Maybe<Scalars['String']>;
  height?: Maybe<Scalars['Int']>;
  block?: Maybe<Scalars['String']>;
};

export type ContractStorage = {
  __typename?: 'ContractStorage';
  meta?: Maybe<ContractStorageMeta>;
  value?: Maybe<Scalars['JSON']>;
  fa12BigMap?: Maybe<Array<Maybe<BigMapKv>>>;
};

export type ContractStorageMeta = {
  __typename?: 'ContractStorageMeta';
  contract?: Maybe<Scalars['String']>;
  time?: Maybe<Scalars['String']>;
  height?: Maybe<Scalars['Int']>;
  block?: Maybe<Scalars['String']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  createNonFungibleToken: PublishedOperation;
};

export type MutationCreateNonFungibleTokenArgs = {
  name: Scalars['String'];
  description: Scalars['String'];
  symbol: Scalars['String'];
  ipfs_cid: Scalars['String'];
};

export type NonFungibleToken = {
  __typename?: 'NonFungibleToken';
  name: Scalars['String'];
  symbol: Scalars['String'];
  token_id: Scalars['String'];
  extras: Scalars['JSON'];
  decimals: Scalars['Int'];
  owner: Scalars['String'];
};

export type Operation = {
  __typename?: 'Operation';
  hash?: Maybe<Scalars['String']>;
  time?: Maybe<Scalars['String']>;
};

export type PublishedOperation = {
  __typename?: 'PublishedOperation';
  id: Scalars['Int'];
  hash: Scalars['String'];
  initiator: Scalars['String'];
  method: Scalars['String'];
  params: Scalars['String'];
  status: Scalars['String'];
  retry: Scalars['Boolean'];
};

export type Query = {
  __typename?: 'Query';
  nfts?: Maybe<Array<Maybe<NonFungibleToken>>>;
  nftByTokenId?: Maybe<NonFungibleToken>;
  nftByOwner?: Maybe<NonFungibleToken>;
  nftByOperation?: Maybe<NonFungibleToken>;
  publishedOperationByHash?: Maybe<PublishedOperation>;
  publishedOperationsByInitiator?: Maybe<Array<Maybe<PublishedOperation>>>;
  publishedOperationsByMethod?: Maybe<Array<Maybe<PublishedOperation>>>;
  publishedOperationsByStatus?: Maybe<Array<Maybe<PublishedOperation>>>;
  settings: Settings;
};

export type QueryNftsArgs = {
  limit?: Maybe<Scalars['Int']>;
};

export type QueryNftByTokenIdArgs = {
  token_id: Scalars['String'];
};

export type QueryNftByOwnerArgs = {
  owner_address: Scalars['String'];
};

export type QueryNftByOperationArgs = {
  operation_address: Scalars['String'];
};

export type QueryPublishedOperationByHashArgs = {
  hash: Scalars['String'];
};

export type QueryPublishedOperationsByInitiatorArgs = {
  initiator: Scalars['String'];
};

export type QueryPublishedOperationsByMethodArgs = {
  method: Scalars['String'];
};

export type QueryPublishedOperationsByStatusArgs = {
  status: Scalars['String'];
};

export type Settings = {
  __typename?: 'Settings';
  tzStatsUrl: Scalars['String'];
  minterContractAddress?: Maybe<Scalars['String']>;
  nftContractAddress?: Maybe<Scalars['String']>;
  adminAddress?: Maybe<Scalars['String']>;
};

export type Subscription = {
  __typename?: 'Subscription';
  operationSent?: Maybe<PublishedOperation>;
  operationConfirmed?: Maybe<PublishedOperation>;
};
