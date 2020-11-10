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
  Upload: any;
};

export type ContractInfo = {
  __typename?: 'ContractInfo';
  address: Scalars['String'];
  name: Scalars['String'];
};

export type IpfsContent = {
  __typename?: 'IpfsContent';
  cid: Scalars['String'];
  size: Scalars['Int'];
  url: Scalars['String'];
  publicGatewayUrl: Scalars['String'];
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
  contractInfo: ContractInfo;
  tokenId: Scalars['String'];
  symbol: Scalars['String'];
  name: Scalars['String'];
  owner: Scalars['String'];
  extras: Scalars['JSON'];
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
  nfts: Array<NonFungibleToken>;
  contractNames: Array<ContractInfo>;
  nftsBcd: Array<NonFungibleToken>;
  contractNamesBcd: Array<ContractInfo>;
  nftByTokenId?: Maybe<NonFungibleToken>;
  nftByOperation?: Maybe<NonFungibleToken>;
  publishedOperationByHash?: Maybe<PublishedOperation>;
  settings: Settings;
};

export type QueryNftsArgs = {
  ownerAddress?: Maybe<Scalars['String']>;
  contractAddress?: Maybe<Scalars['String']>;
};

export type QueryContractNamesArgs = {
  contractOwnerAddress?: Maybe<Scalars['String']>;
  nftOwnerAddress?: Maybe<Scalars['String']>;
};

export type QueryNftsBcdArgs = {
  ownerAddress?: Maybe<Scalars['String']>;
  contractAddress?: Maybe<Scalars['String']>;
};

export type QueryContractNamesBcdArgs = {
  contractOwnerAddress?: Maybe<Scalars['String']>;
  nftOwnerAddress?: Maybe<Scalars['String']>;
};

export type QueryNftByTokenIdArgs = {
  token_id: Scalars['String'];
};

export type QueryNftByOperationArgs = {
  operation_address: Scalars['String'];
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
