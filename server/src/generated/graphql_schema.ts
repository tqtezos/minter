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
  Int: ResolverTypeWrapper<Scalars['Int']>;
  NonFungibleToken: ResolverTypeWrapper<NonFungibleToken>;
  String: ResolverTypeWrapper<Scalars['String']>;
  JSON: ResolverTypeWrapper<Scalars['JSON']>;
  PublishedOperation: ResolverTypeWrapper<PublishedOperation>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  Settings: ResolverTypeWrapper<Settings>;
  SettingsAdmin: ResolverTypeWrapper<SettingsAdmin>;
  SettingsContracts: ResolverTypeWrapper<SettingsContracts>;
  Mutation: ResolverTypeWrapper<{}>;
  Subscription: ResolverTypeWrapper<{}>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  Query: {};
  Int: Scalars['Int'];
  NonFungibleToken: NonFungibleToken;
  String: Scalars['String'];
  JSON: Scalars['JSON'];
  PublishedOperation: PublishedOperation;
  Boolean: Scalars['Boolean'];
  Settings: Settings;
  SettingsAdmin: SettingsAdmin;
  SettingsContracts: SettingsContracts;
  Mutation: {};
  Subscription: {};
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
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  symbol?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  token_id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  extras?: Resolver<ResolversTypes['JSON'], ParentType, ContextType>;
  decimals?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  owner?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
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
  nfts?: Resolver<
    Maybe<Array<Maybe<ResolversTypes['NonFungibleToken']>>>,
    ParentType,
    ContextType,
    RequireFields<QueryNftsArgs, never>
  >;
  nftByTokenId?: Resolver<
    Maybe<ResolversTypes['NonFungibleToken']>,
    ParentType,
    ContextType,
    RequireFields<QueryNftByTokenIdArgs, 'token_id'>
  >;
  nftsByOwner?: Resolver<
    Maybe<Array<Maybe<ResolversTypes['NonFungibleToken']>>>,
    ParentType,
    ContextType,
    RequireFields<QueryNftsByOwnerArgs, 'owner_address'>
  >;
  nftByOperation?: Resolver<
    Maybe<ResolversTypes['NonFungibleToken']>,
    ParentType,
    ContextType,
    RequireFields<QueryNftByOperationArgs, 'operation_address'>
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
  tzStatsUrl?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  rpc?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  admin?: Resolver<ResolversTypes['SettingsAdmin'], ParentType, ContextType>;
  contracts?: Resolver<
    ResolversTypes['SettingsContracts'],
    ParentType,
    ContextType
  >;
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

export type Resolvers<ContextType = Context> = ResolversObject<{
  JSON?: GraphQLScalarType;
  Mutation?: MutationResolvers<ContextType>;
  NonFungibleToken?: NonFungibleTokenResolvers<ContextType>;
  PublishedOperation?: PublishedOperationResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Settings?: SettingsResolvers<ContextType>;
  SettingsAdmin?: SettingsAdminResolvers<ContextType>;
  SettingsContracts?: SettingsContractsResolvers<ContextType>;
  Subscription?: SubscriptionResolvers<ContextType>;
}>;

/**
 * @deprecated
 * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
 */
export type IResolvers<ContextType = Context> = Resolvers<ContextType>;
