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

export type ContractInfo = {
  __typename?: 'ContractInfo';
  address: Scalars['String'];
  name: Scalars['String'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createNonFungibleToken: PublishedOperation;
  createNonFungibleTokenSync: PublishedOperation;
};

export type MutationCreateNonFungibleTokenArgs = {
  owner_address: Scalars['String'];
  name: Scalars['String'];
  description: Scalars['String'];
  symbol: Scalars['String'];
  ipfs_cid: Scalars['String'];
};

export type MutationCreateNonFungibleTokenSyncArgs = {
  owner_address: Scalars['String'];
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
  nftsByOwner?: Maybe<Array<Maybe<NonFungibleToken>>>;
  nftByOperation?: Maybe<NonFungibleToken>;
  contractNamesByOwner: Array<ContractInfo>;
  publishedOperationByHash?: Maybe<PublishedOperation>;
  settings: Settings;
};

export type QueryNftsArgs = {
  limit?: Maybe<Scalars['Int']>;
};

export type QueryNftByTokenIdArgs = {
  token_id: Scalars['String'];
};

export type QueryNftsByOwnerArgs = {
  owner_address: Scalars['String'];
};

export type QueryNftByOperationArgs = {
  operation_address: Scalars['String'];
};

export type QueryContractNamesByOwnerArgs = {
  owner_address?: Maybe<Scalars['String']>;
};

export type QueryPublishedOperationByHashArgs = {
  hash: Scalars['String'];
};

export type Settings = {
  __typename?: 'Settings';
  tzStatsUrl: Scalars['String'];
  rpc: Scalars['String'];
  admin: SettingsAdmin;
  contracts: SettingsContracts;
};

export type SettingsAdmin = {
  __typename?: 'SettingsAdmin';
  address: Scalars['String'];
  secret: Scalars['String'];
};

export type SettingsContracts = {
  __typename?: 'SettingsContracts';
  nftFaucet: Scalars['String'];
  nftFactory: Scalars['String'];
};

export type Subscription = {
  __typename?: 'Subscription';
  operationSent?: Maybe<PublishedOperation>;
  operationConfirmed?: Maybe<PublishedOperation>;
};
