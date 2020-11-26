import {
  GraphQLResolveInfo,
  GraphQLScalarType,
  GraphQLScalarTypeConfig
} from 'graphql';
import { Context } from './../components/context';
export type Maybe<T> = T | null;
export type RequireFields<T, K extends keyof T> = {
  [X in Exclude<keyof T, K>]?: T[X];
} &
  { [P in K]-?: NonNullable<T[P]> };
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
  tokenId: Scalars['Int'];
  symbol: Scalars['String'];
  name: Scalars['String'];
  owner: Scalars['String'];
  extras: Scalars['JSON'];
};

export type OperationStatus = {
  __typename?: 'OperationStatus';
  status: OperationStatusType;
  timestamp: Scalars['String'];
  error?: Maybe<Scalars['JSON']>;
};

export enum OperationStatusType {
  Applied = 'APPLIED',
  Failed = 'FAILED'
}

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
  indexerStats: Array<Maybe<Stats>>;
  nfts: Array<NonFungibleToken>;
  contractNames: Array<ContractInfo>;
  contractOperationStatus?: Maybe<OperationStatus>;
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

export type QueryContractOperationStatusArgs = {
  contractAddress: Scalars['String'];
  hash: Scalars['String'];
};

export type QueryPublishedOperationByHashArgs = {
  hash: Scalars['String'];
};

export type Settings = {
  __typename?: 'Settings';
  rpc: Scalars['String'];
  admin: SettingsAdmin;
  contracts: SettingsContracts;
  bcdGuiUrl: Scalars['String'];
  bcdNetwork: Scalars['String'];
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

export type Stats = {
  __typename?: 'Stats';
  chainId: Scalars['String'];
  hash: Scalars['String'];
  level: Scalars['Int'];
  network: Scalars['String'];
  predecessor: Scalars['String'];
  protocol: Scalars['String'];
  timestamp: Scalars['String'];
};

export type Subscription = {
  __typename?: 'Subscription';
  operationSent?: Maybe<PublishedOperation>;
  operationConfirmed?: Maybe<PublishedOperation>;
};

export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;

export type LegacyStitchingResolver<TResult, TParent, TContext, TArgs> = {
  fragment: string;
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};

export type NewStitchingResolver<TResult, TParent, TContext, TArgs> = {
  selectionSet: string;
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type StitchingResolver<TResult, TParent, TContext, TArgs> =
  | LegacyStitchingResolver<TResult, TParent, TContext, TArgs>
  | NewStitchingResolver<TResult, TParent, TContext, TArgs>;
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
  | ResolverFn<TResult, TParent, TContext, TArgs>
  | StitchingResolver<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterator<TResult> | Promise<AsyncIterator<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<
  TResult,
  TKey extends string,
  TParent,
  TContext,
  TArgs
> {
  subscribe: SubscriptionSubscribeFn<
    { [key in TKey]: TResult },
    TParent,
    TContext,
    TArgs
  >;
  resolve?: SubscriptionResolveFn<
    TResult,
    { [key in TKey]: TResult },
    TContext,
    TArgs
  >;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<
  TResult,
  TKey extends string,
  TParent,
  TContext,
  TArgs
> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<
  TResult,
  TKey extends string,
  TParent = {},
  TContext = {},
  TArgs = {}
> =
  | ((
      ...args: any[]
    ) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}> = (
  obj: T,
  info: GraphQLResolveInfo
) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<
  TResult = {},
  TParent = {},
  TContext = {},
  TArgs = {}
> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  Query: ResolverTypeWrapper<{}>;
  Stats: ResolverTypeWrapper<Stats>;
  String: ResolverTypeWrapper<Scalars['String']>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  NonFungibleToken: ResolverTypeWrapper<NonFungibleToken>;
  ContractInfo: ResolverTypeWrapper<ContractInfo>;
  JSON: ResolverTypeWrapper<Scalars['JSON']>;
  OperationStatus: ResolverTypeWrapper<OperationStatus>;
  OperationStatusType: OperationStatusType;
  PublishedOperation: ResolverTypeWrapper<PublishedOperation>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  Settings: ResolverTypeWrapper<Settings>;
  SettingsAdmin: ResolverTypeWrapper<SettingsAdmin>;
  SettingsContracts: ResolverTypeWrapper<SettingsContracts>;
  Mutation: ResolverTypeWrapper<{}>;
  Subscription: ResolverTypeWrapper<{}>;
  Upload: ResolverTypeWrapper<Scalars['Upload']>;
  IpfsContent: ResolverTypeWrapper<IpfsContent>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  Query: {};
  Stats: Stats;
  String: Scalars['String'];
  Int: Scalars['Int'];
  NonFungibleToken: NonFungibleToken;
  ContractInfo: ContractInfo;
  JSON: Scalars['JSON'];
  OperationStatus: OperationStatus;
  PublishedOperation: PublishedOperation;
  Boolean: Scalars['Boolean'];
  Settings: Settings;
  SettingsAdmin: SettingsAdmin;
  SettingsContracts: SettingsContracts;
  Mutation: {};
  Subscription: {};
  Upload: Scalars['Upload'];
  IpfsContent: IpfsContent;
}>;

export type ContractInfoResolvers<
  ContextType = Context,
  ParentType extends ResolversParentTypes['ContractInfo'] = ResolversParentTypes['ContractInfo']
> = ResolversObject<{
  address?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
}>;

export type IpfsContentResolvers<
  ContextType = Context,
  ParentType extends ResolversParentTypes['IpfsContent'] = ResolversParentTypes['IpfsContent']
> = ResolversObject<{
  cid?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  size?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  publicGatewayUrl?: Resolver<
    ResolversTypes['String'],
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
}>;

export interface JsonScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes['JSON'], any> {
  name: 'JSON';
}

export type MutationResolvers<
  ContextType = Context,
  ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']
> = ResolversObject<{
  createNonFungibleToken?: Resolver<
    ResolversTypes['PublishedOperation'],
    ParentType,
    ContextType,
    RequireFields<
      MutationCreateNonFungibleTokenArgs,
      'owner_address' | 'name' | 'description' | 'symbol' | 'ipfs_cid'
    >
  >;
  createNonFungibleTokenSync?: Resolver<
    ResolversTypes['PublishedOperation'],
    ParentType,
    ContextType,
    RequireFields<
      MutationCreateNonFungibleTokenSyncArgs,
      'owner_address' | 'name' | 'description' | 'symbol' | 'ipfs_cid'
    >
  >;
}>;

export type NonFungibleTokenResolvers<
  ContextType = Context,
  ParentType extends ResolversParentTypes['NonFungibleToken'] = ResolversParentTypes['NonFungibleToken']
> = ResolversObject<{
  contractInfo?: Resolver<
    ResolversTypes['ContractInfo'],
    ParentType,
    ContextType
  >;
  tokenId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  symbol?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  owner?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  extras?: Resolver<ResolversTypes['JSON'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
}>;

export type OperationStatusResolvers<
  ContextType = Context,
  ParentType extends ResolversParentTypes['OperationStatus'] = ResolversParentTypes['OperationStatus']
> = ResolversObject<{
  status?: Resolver<
    ResolversTypes['OperationStatusType'],
    ParentType,
    ContextType
  >;
  timestamp?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  error?: Resolver<Maybe<ResolversTypes['JSON']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
}>;

export type PublishedOperationResolvers<
  ContextType = Context,
  ParentType extends ResolversParentTypes['PublishedOperation'] = ResolversParentTypes['PublishedOperation']
> = ResolversObject<{
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  hash?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  initiator?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  method?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  params?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  retry?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
}>;

export type QueryResolvers<
  ContextType = Context,
  ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']
> = ResolversObject<{
  indexerStats?: Resolver<
    Array<Maybe<ResolversTypes['Stats']>>,
    ParentType,
    ContextType
  >;
  nfts?: Resolver<
    Array<ResolversTypes['NonFungibleToken']>,
    ParentType,
    ContextType,
    RequireFields<QueryNftsArgs, never>
  >;
  contractNames?: Resolver<
    Array<ResolversTypes['ContractInfo']>,
    ParentType,
    ContextType,
    RequireFields<QueryContractNamesArgs, never>
  >;
  contractOperationStatus?: Resolver<
    Maybe<ResolversTypes['OperationStatus']>,
    ParentType,
    ContextType,
    RequireFields<QueryContractOperationStatusArgs, 'contractAddress' | 'hash'>
  >;
  publishedOperationByHash?: Resolver<
    Maybe<ResolversTypes['PublishedOperation']>,
    ParentType,
    ContextType,
    RequireFields<QueryPublishedOperationByHashArgs, 'hash'>
  >;
  settings?: Resolver<ResolversTypes['Settings'], ParentType, ContextType>;
}>;

export type SettingsResolvers<
  ContextType = Context,
  ParentType extends ResolversParentTypes['Settings'] = ResolversParentTypes['Settings']
> = ResolversObject<{
  rpc?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  admin?: Resolver<ResolversTypes['SettingsAdmin'], ParentType, ContextType>;
  contracts?: Resolver<
    ResolversTypes['SettingsContracts'],
    ParentType,
    ContextType
  >;
  bcdGuiUrl?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  bcdNetwork?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
}>;

export type SettingsAdminResolvers<
  ContextType = Context,
  ParentType extends ResolversParentTypes['SettingsAdmin'] = ResolversParentTypes['SettingsAdmin']
> = ResolversObject<{
  address?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  secret?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
}>;

export type SettingsContractsResolvers<
  ContextType = Context,
  ParentType extends ResolversParentTypes['SettingsContracts'] = ResolversParentTypes['SettingsContracts']
> = ResolversObject<{
  nftFaucet?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  nftFactory?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
}>;

export type StatsResolvers<
  ContextType = Context,
  ParentType extends ResolversParentTypes['Stats'] = ResolversParentTypes['Stats']
> = ResolversObject<{
  chainId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  hash?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  level?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  network?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  predecessor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  protocol?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  timestamp?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
}>;

export type SubscriptionResolvers<
  ContextType = Context,
  ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription']
> = ResolversObject<{
  operationSent?: SubscriptionResolver<
    Maybe<ResolversTypes['PublishedOperation']>,
    'operationSent',
    ParentType,
    ContextType
  >;
  operationConfirmed?: SubscriptionResolver<
    Maybe<ResolversTypes['PublishedOperation']>,
    'operationConfirmed',
    ParentType,
    ContextType
  >;
}>;

export interface UploadScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes['Upload'], any> {
  name: 'Upload';
}

export type Resolvers<ContextType = Context> = ResolversObject<{
  ContractInfo?: ContractInfoResolvers<ContextType>;
  IpfsContent?: IpfsContentResolvers<ContextType>;
  JSON?: GraphQLScalarType;
  Mutation?: MutationResolvers<ContextType>;
  NonFungibleToken?: NonFungibleTokenResolvers<ContextType>;
  OperationStatus?: OperationStatusResolvers<ContextType>;
  PublishedOperation?: PublishedOperationResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Settings?: SettingsResolvers<ContextType>;
  SettingsAdmin?: SettingsAdminResolvers<ContextType>;
  SettingsContracts?: SettingsContractsResolvers<ContextType>;
  Stats?: StatsResolvers<ContextType>;
  Subscription?: SubscriptionResolvers<ContextType>;
  Upload?: GraphQLScalarType;
}>;

/**
 * @deprecated
 * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
 */
export type IResolvers<ContextType = Context> = Resolvers<ContextType>;
