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
  ipfs_hash: Scalars['String'];
};

export type NonFungibleToken = {
  __typename?: 'NonFungibleToken';
  id: Scalars['Int'];
  token_id: Scalars['String'];
  creator_address: Scalars['String'];
  operation_address: Scalars['String'];
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
  nftTokens?: Maybe<Array<Maybe<NonFungibleToken>>>;
  nftByTokenId?: Maybe<NonFungibleToken>;
  nftByCreatorAddress?: Maybe<NonFungibleToken>;
  nftByOperationAddress?: Maybe<NonFungibleToken>;
  publishedOperationByHash?: Maybe<PublishedOperation>;
  publishedOperationsByInitiator?: Maybe<Array<Maybe<PublishedOperation>>>;
  publishedOperationsByMethod?: Maybe<Array<Maybe<PublishedOperation>>>;
  publishedOperationsByStatus?: Maybe<Array<Maybe<PublishedOperation>>>;
  settings: Settings;
};

export type QueryNftTokensArgs = {
  limit?: Maybe<Scalars['Int']>;
};

export type QueryNftByTokenIdArgs = {
  token_id: Scalars['String'];
};

export type QueryNftByCreatorAddressArgs = {
  creator_address: Scalars['String'];
};

export type QueryNftByOperationAddressArgs = {
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
  PublishedOperation: ResolverTypeWrapper<PublishedOperation>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  Settings: ResolverTypeWrapper<Settings>;
  Mutation: ResolverTypeWrapper<{}>;
  Subscription: ResolverTypeWrapper<{}>;
  JSON: ResolverTypeWrapper<Scalars['JSON']>;
  ContractStorageMeta: ResolverTypeWrapper<ContractStorageMeta>;
  BigMapMeta: ResolverTypeWrapper<BigMapMeta>;
  BigMapKV: ResolverTypeWrapper<BigMapKv>;
  ContractStorage: ResolverTypeWrapper<ContractStorage>;
  Operation: ResolverTypeWrapper<Operation>;
  ContractOperationParams: ResolverTypeWrapper<ContractOperationParams>;
  ContractOperationStorageMeta: ResolverTypeWrapper<
    ContractOperationStorageMeta
  >;
  ContractOperationStorage: ResolverTypeWrapper<ContractOperationStorage>;
  BigMapDiffItemMeta: ResolverTypeWrapper<BigMapDiffItemMeta>;
  BigMapDiffItem: ResolverTypeWrapper<BigMapDiffItem>;
  ContractOperation: ResolverTypeWrapper<ContractOperation>;
  Float: ResolverTypeWrapper<Scalars['Float']>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  Query: {};
  Int: Scalars['Int'];
  NonFungibleToken: NonFungibleToken;
  String: Scalars['String'];
  PublishedOperation: PublishedOperation;
  Boolean: Scalars['Boolean'];
  Settings: Settings;
  Mutation: {};
  Subscription: {};
  JSON: Scalars['JSON'];
  ContractStorageMeta: ContractStorageMeta;
  BigMapMeta: BigMapMeta;
  BigMapKV: BigMapKv;
  ContractStorage: ContractStorage;
  Operation: Operation;
  ContractOperationParams: ContractOperationParams;
  ContractOperationStorageMeta: ContractOperationStorageMeta;
  ContractOperationStorage: ContractOperationStorage;
  BigMapDiffItemMeta: BigMapDiffItemMeta;
  BigMapDiffItem: BigMapDiffItem;
  ContractOperation: ContractOperation;
  Float: Scalars['Float'];
}>;

export type BigMapDiffItemResolvers<
  ContextType = Context,
  ParentType extends ResolversParentTypes['BigMapDiffItem'] = ResolversParentTypes['BigMapDiffItem']
> = ResolversObject<{
  key?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  key_hash?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  key_binary?: Resolver<
    Maybe<ResolversTypes['String']>,
    ParentType,
    ContextType
  >;
  value?: Resolver<Maybe<ResolversTypes['JSON']>, ParentType, ContextType>;
  meta?: Resolver<
    Maybe<ResolversTypes['BigMapDiffItemMeta']>,
    ParentType,
    ContextType
  >;
  action?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
}>;

export type BigMapDiffItemMetaResolvers<
  ContextType = Context,
  ParentType extends ResolversParentTypes['BigMapDiffItemMeta'] = ResolversParentTypes['BigMapDiffItemMeta']
> = ResolversObject<{
  contract?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  bigmap_id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  time?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  height?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  block?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
}>;

export type BigMapKvResolvers<
  ContextType = Context,
  ParentType extends ResolversParentTypes['BigMapKV'] = ResolversParentTypes['BigMapKV']
> = ResolversObject<{
  key?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  key_hash?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  key_binary?: Resolver<
    Maybe<ResolversTypes['String']>,
    ParentType,
    ContextType
  >;
  value?: Resolver<Maybe<ResolversTypes['JSON']>, ParentType, ContextType>;
  meta?: Resolver<Maybe<ResolversTypes['BigMapMeta']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
}>;

export type BigMapMetaResolvers<
  ContextType = Context,
  ParentType extends ResolversParentTypes['BigMapMeta'] = ResolversParentTypes['BigMapMeta']
> = ResolversObject<{
  contract?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  bigmap_id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  time?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  height?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  block?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  is_replaced?: Resolver<
    Maybe<ResolversTypes['Boolean']>,
    ParentType,
    ContextType
  >;
  is_removed?: Resolver<
    Maybe<ResolversTypes['Boolean']>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
}>;

export type ContractOperationResolvers<
  ContextType = Context,
  ParentType extends ResolversParentTypes['ContractOperation'] = ResolversParentTypes['ContractOperation']
> = ResolversObject<{
  hash?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  block?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  time?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  height?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  cycle?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  counter?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  op_n?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  op_c?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  op_i?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  status?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  is_success?: Resolver<
    Maybe<ResolversTypes['Boolean']>,
    ParentType,
    ContextType
  >;
  is_contract?: Resolver<
    Maybe<ResolversTypes['Boolean']>,
    ParentType,
    ContextType
  >;
  gas_limit?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  gas_used?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  gas_price?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  storage_limit?: Resolver<
    Maybe<ResolversTypes['Int']>,
    ParentType,
    ContextType
  >;
  storage_size?: Resolver<
    Maybe<ResolversTypes['Int']>,
    ParentType,
    ContextType
  >;
  storage_paid?: Resolver<
    Maybe<ResolversTypes['Int']>,
    ParentType,
    ContextType
  >;
  volume?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  fee?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  reward?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  deposit?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  burned?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  is_internal?: Resolver<
    Maybe<ResolversTypes['Boolean']>,
    ParentType,
    ContextType
  >;
  has_data?: Resolver<
    Maybe<ResolversTypes['Boolean']>,
    ParentType,
    ContextType
  >;
  days_destroyed?: Resolver<
    Maybe<ResolversTypes['Int']>,
    ParentType,
    ContextType
  >;
  parameters?: Resolver<
    Maybe<ResolversTypes['ContractOperationParams']>,
    ParentType,
    ContextType
  >;
  storage?: Resolver<
    Maybe<ResolversTypes['ContractOperationStorage']>,
    ParentType,
    ContextType
  >;
  big_map_diff?: Resolver<
    Maybe<Array<Maybe<ResolversTypes['BigMapDiffItem']>>>,
    ParentType,
    ContextType
  >;
  sender?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  receiver?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  branch_id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  branch_height?: Resolver<
    Maybe<ResolversTypes['Int']>,
    ParentType,
    ContextType
  >;
  branch_depth?: Resolver<
    Maybe<ResolversTypes['Int']>,
    ParentType,
    ContextType
  >;
  branch?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
}>;

export type ContractOperationParamsResolvers<
  ContextType = Context,
  ParentType extends ResolversParentTypes['ContractOperationParams'] = ResolversParentTypes['ContractOperationParams']
> = ResolversObject<{
  entrypoint?: Resolver<
    Maybe<ResolversTypes['String']>,
    ParentType,
    ContextType
  >;
  branch?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  value?: Resolver<Maybe<ResolversTypes['JSON']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
}>;

export type ContractOperationStorageResolvers<
  ContextType = Context,
  ParentType extends ResolversParentTypes['ContractOperationStorage'] = ResolversParentTypes['ContractOperationStorage']
> = ResolversObject<{
  meta?: Resolver<
    Maybe<ResolversTypes['ContractOperationStorageMeta']>,
    ParentType,
    ContextType
  >;
  value?: Resolver<Maybe<ResolversTypes['JSON']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
}>;

export type ContractOperationStorageMetaResolvers<
  ContextType = Context,
  ParentType extends ResolversParentTypes['ContractOperationStorageMeta'] = ResolversParentTypes['ContractOperationStorageMeta']
> = ResolversObject<{
  contract?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  time?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  height?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  block?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
}>;

export type ContractStorageResolvers<
  ContextType = Context,
  ParentType extends ResolversParentTypes['ContractStorage'] = ResolversParentTypes['ContractStorage']
> = ResolversObject<{
  meta?: Resolver<
    Maybe<ResolversTypes['ContractStorageMeta']>,
    ParentType,
    ContextType
  >;
  value?: Resolver<Maybe<ResolversTypes['JSON']>, ParentType, ContextType>;
  fa12BigMap?: Resolver<
    Maybe<Array<Maybe<ResolversTypes['BigMapKV']>>>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
}>;

export type ContractStorageMetaResolvers<
  ContextType = Context,
  ParentType extends ResolversParentTypes['ContractStorageMeta'] = ResolversParentTypes['ContractStorageMeta']
> = ResolversObject<{
  contract?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  time?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  height?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  block?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
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
      'name' | 'description' | 'symbol' | 'ipfs_hash'
    >
  >;
}>;

export type NonFungibleTokenResolvers<
  ContextType = Context,
  ParentType extends ResolversParentTypes['NonFungibleToken'] = ResolversParentTypes['NonFungibleToken']
> = ResolversObject<{
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  token_id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  creator_address?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  operation_address?: Resolver<
    ResolversTypes['String'],
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
}>;

export type OperationResolvers<
  ContextType = Context,
  ParentType extends ResolversParentTypes['Operation'] = ResolversParentTypes['Operation']
> = ResolversObject<{
  hash?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  time?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
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
  nftTokens?: Resolver<
    Maybe<Array<Maybe<ResolversTypes['NonFungibleToken']>>>,
    ParentType,
    ContextType,
    RequireFields<QueryNftTokensArgs, never>
  >;
  nftByTokenId?: Resolver<
    Maybe<ResolversTypes['NonFungibleToken']>,
    ParentType,
    ContextType,
    RequireFields<QueryNftByTokenIdArgs, 'token_id'>
  >;
  nftByCreatorAddress?: Resolver<
    Maybe<ResolversTypes['NonFungibleToken']>,
    ParentType,
    ContextType,
    RequireFields<QueryNftByCreatorAddressArgs, 'creator_address'>
  >;
  nftByOperationAddress?: Resolver<
    Maybe<ResolversTypes['NonFungibleToken']>,
    ParentType,
    ContextType,
    RequireFields<QueryNftByOperationAddressArgs, 'operation_address'>
  >;
  publishedOperationByHash?: Resolver<
    Maybe<ResolversTypes['PublishedOperation']>,
    ParentType,
    ContextType,
    RequireFields<QueryPublishedOperationByHashArgs, 'hash'>
  >;
  publishedOperationsByInitiator?: Resolver<
    Maybe<Array<Maybe<ResolversTypes['PublishedOperation']>>>,
    ParentType,
    ContextType,
    RequireFields<QueryPublishedOperationsByInitiatorArgs, 'initiator'>
  >;
  publishedOperationsByMethod?: Resolver<
    Maybe<Array<Maybe<ResolversTypes['PublishedOperation']>>>,
    ParentType,
    ContextType,
    RequireFields<QueryPublishedOperationsByMethodArgs, 'method'>
  >;
  publishedOperationsByStatus?: Resolver<
    Maybe<Array<Maybe<ResolversTypes['PublishedOperation']>>>,
    ParentType,
    ContextType,
    RequireFields<QueryPublishedOperationsByStatusArgs, 'status'>
  >;
  settings?: Resolver<ResolversTypes['Settings'], ParentType, ContextType>;
}>;

export type SettingsResolvers<
  ContextType = Context,
  ParentType extends ResolversParentTypes['Settings'] = ResolversParentTypes['Settings']
> = ResolversObject<{
  tzStatsUrl?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  minterContractAddress?: Resolver<
    Maybe<ResolversTypes['String']>,
    ParentType,
    ContextType
  >;
  nftContractAddress?: Resolver<
    Maybe<ResolversTypes['String']>,
    ParentType,
    ContextType
  >;
  adminAddress?: Resolver<
    Maybe<ResolversTypes['String']>,
    ParentType,
    ContextType
  >;
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
  BigMapDiffItem?: BigMapDiffItemResolvers<ContextType>;
  BigMapDiffItemMeta?: BigMapDiffItemMetaResolvers<ContextType>;
  BigMapKV?: BigMapKvResolvers<ContextType>;
  BigMapMeta?: BigMapMetaResolvers<ContextType>;
  ContractOperation?: ContractOperationResolvers<ContextType>;
  ContractOperationParams?: ContractOperationParamsResolvers<ContextType>;
  ContractOperationStorage?: ContractOperationStorageResolvers<ContextType>;
  ContractOperationStorageMeta?: ContractOperationStorageMetaResolvers<
    ContextType
  >;
  ContractStorage?: ContractStorageResolvers<ContextType>;
  ContractStorageMeta?: ContractStorageMetaResolvers<ContextType>;
  JSON?: GraphQLScalarType;
  Mutation?: MutationResolvers<ContextType>;
  NonFungibleToken?: NonFungibleTokenResolvers<ContextType>;
  Operation?: OperationResolvers<ContextType>;
  PublishedOperation?: PublishedOperationResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Settings?: SettingsResolvers<ContextType>;
  Subscription?: SubscriptionResolvers<ContextType>;
}>;

/**
 * @deprecated
 * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
 */
export type IResolvers<ContextType = Context> = Resolvers<ContextType>;
