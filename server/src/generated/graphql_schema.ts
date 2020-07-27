import {
  GraphQLResolveInfo,
  GraphQLScalarType,
  GraphQLScalarTypeConfig,
} from "graphql";
import { SessionContext } from "./../components/context";
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
  __typename?: "BigMapDiffItem";
  key?: Maybe<Scalars["String"]>;
  key_hash?: Maybe<Scalars["String"]>;
  key_binary?: Maybe<Scalars["String"]>;
  value?: Maybe<Scalars["JSON"]>;
  meta?: Maybe<BigMapDiffItemMeta>;
  action?: Maybe<Scalars["String"]>;
};

export type BigMapDiffItemMeta = {
  __typename?: "BigMapDiffItemMeta";
  contract?: Maybe<Scalars["String"]>;
  bigmap_id?: Maybe<Scalars["Int"]>;
  time?: Maybe<Scalars["String"]>;
  height?: Maybe<Scalars["Int"]>;
  block?: Maybe<Scalars["String"]>;
};

export type BigMapKv = {
  __typename?: "BigMapKV";
  key?: Maybe<Scalars["String"]>;
  key_hash?: Maybe<Scalars["String"]>;
  key_binary?: Maybe<Scalars["String"]>;
  value?: Maybe<Scalars["JSON"]>;
  meta?: Maybe<BigMapMeta>;
};

export type BigMapMeta = {
  __typename?: "BigMapMeta";
  contract?: Maybe<Scalars["String"]>;
  bigmap_id?: Maybe<Scalars["Int"]>;
  time?: Maybe<Scalars["String"]>;
  height?: Maybe<Scalars["Int"]>;
  block?: Maybe<Scalars["String"]>;
  is_replaced?: Maybe<Scalars["Boolean"]>;
  is_removed?: Maybe<Scalars["Boolean"]>;
};

export type ContractOperation = {
  __typename?: "ContractOperation";
  hash?: Maybe<Scalars["String"]>;
  type?: Maybe<Scalars["String"]>;
  block?: Maybe<Scalars["String"]>;
  time?: Maybe<Scalars["String"]>;
  height?: Maybe<Scalars["Int"]>;
  cycle?: Maybe<Scalars["Int"]>;
  counter?: Maybe<Scalars["Int"]>;
  op_n?: Maybe<Scalars["Int"]>;
  op_c?: Maybe<Scalars["Int"]>;
  op_i?: Maybe<Scalars["Int"]>;
  status?: Maybe<Scalars["String"]>;
  is_success?: Maybe<Scalars["Boolean"]>;
  is_contract?: Maybe<Scalars["Boolean"]>;
  gas_limit?: Maybe<Scalars["Int"]>;
  gas_used?: Maybe<Scalars["Int"]>;
  gas_price?: Maybe<Scalars["Float"]>;
  storage_limit?: Maybe<Scalars["Int"]>;
  storage_size?: Maybe<Scalars["Int"]>;
  storage_paid?: Maybe<Scalars["Int"]>;
  volume?: Maybe<Scalars["Int"]>;
  fee?: Maybe<Scalars["Float"]>;
  reward?: Maybe<Scalars["Int"]>;
  deposit?: Maybe<Scalars["Int"]>;
  burned?: Maybe<Scalars["Int"]>;
  is_internal?: Maybe<Scalars["Boolean"]>;
  has_data?: Maybe<Scalars["Boolean"]>;
  days_destroyed?: Maybe<Scalars["Int"]>;
  parameters?: Maybe<ContractOperationParams>;
  storage?: Maybe<ContractOperationStorage>;
  big_map_diff?: Maybe<Array<Maybe<BigMapDiffItem>>>;
  sender?: Maybe<Scalars["String"]>;
  receiver?: Maybe<Scalars["String"]>;
  branch_id?: Maybe<Scalars["Int"]>;
  branch_height?: Maybe<Scalars["Int"]>;
  branch_depth?: Maybe<Scalars["Int"]>;
  branch?: Maybe<Scalars["String"]>;
};

export type ContractOperationParams = {
  __typename?: "ContractOperationParams";
  entrypoint?: Maybe<Scalars["String"]>;
  branch?: Maybe<Scalars["String"]>;
  id?: Maybe<Scalars["Int"]>;
  value?: Maybe<Scalars["JSON"]>;
};

export type ContractOperationStorage = {
  __typename?: "ContractOperationStorage";
  meta?: Maybe<ContractOperationStorageMeta>;
  value?: Maybe<Scalars["JSON"]>;
};

export type ContractOperationStorageMeta = {
  __typename?: "ContractOperationStorageMeta";
  contract?: Maybe<Scalars["String"]>;
  time?: Maybe<Scalars["String"]>;
  height?: Maybe<Scalars["Int"]>;
  block?: Maybe<Scalars["String"]>;
};

export type ContractStorage = {
  __typename?: "ContractStorage";
  meta?: Maybe<ContractStorageMeta>;
  value?: Maybe<Scalars["JSON"]>;
  fa12BigMap?: Maybe<Array<Maybe<BigMapKv>>>;
};

export type ContractStorageMeta = {
  __typename?: "ContractStorageMeta";
  contract?: Maybe<Scalars["String"]>;
  time?: Maybe<Scalars["String"]>;
  height?: Maybe<Scalars["Int"]>;
  block?: Maybe<Scalars["String"]>;
};

export type Mutation = {
  __typename?: "Mutation";
  createProfile: Profile;
  createNonFungibleToken: NonFungibleToken;
};

export type MutationCreateProfileArgs = {
  alias: Scalars["String"];
  address: Scalars["String"];
};

export type MutationCreateNonFungibleTokenArgs = {
  token_id: Scalars["String"];
  creator_address: Scalars["String"];
  operation_address: Scalars["String"];
};

export type NonFungibleToken = {
  __typename?: "NonFungibleToken";
  id: Scalars["Int"];
  token_id: Scalars["String"];
  creator_address: Scalars["String"];
  operation_address: Scalars["String"];
};

export type Operation = {
  __typename?: "Operation";
  hash?: Maybe<Scalars["String"]>;
  time?: Maybe<Scalars["String"]>;
};

export type Profile = {
  __typename?: "Profile";
  id: Scalars["Int"];
  alias?: Maybe<Scalars["String"]>;
  address: Scalars["String"];
};

export type PublishedOperation = {
  __typename?: "PublishedOperation";
  id: Scalars["Int"];
  address: Scalars["String"];
  initiator_address: Scalars["String"];
};

export type Query = {
  __typename?: "Query";
  contractStorage?: Maybe<ContractStorage>;
  contractOperations?: Maybe<Array<Maybe<ContractOperation>>>;
  nftByTokenId?: Maybe<NonFungibleToken>;
  nftByCreatorAddress?: Maybe<NonFungibleToken>;
  nftByOperationAddress?: Maybe<NonFungibleToken>;
  nftTokens?: Maybe<Array<Maybe<NonFungibleToken>>>;
  profileByAddress?: Maybe<Profile>;
  profileByAlias?: Maybe<Profile>;
  publishedOperationByAddress?: Maybe<PublishedOperation>;
  publishedOperationByInitiatorAddress?: Maybe<PublishedOperation>;
  settings: Settings;
};

export type QueryContractStorageArgs = {
  contract_id: Scalars["String"];
};

export type QueryContractOperationsArgs = {
  contract_id: Scalars["String"];
};

export type QueryNftByTokenIdArgs = {
  token_id: Scalars["String"];
};

export type QueryNftByCreatorAddressArgs = {
  creator_address: Scalars["String"];
};

export type QueryNftByOperationAddressArgs = {
  operation_address: Scalars["String"];
};

export type QueryNftTokensArgs = {
  limit?: Maybe<Scalars["Int"]>;
};

export type QueryProfileByAddressArgs = {
  address: Scalars["String"];
};

export type QueryProfileByAliasArgs = {
  alias: Scalars["String"];
};

export type QueryPublishedOperationByAddressArgs = {
  address: Scalars["String"];
};

export type QueryPublishedOperationByInitiatorAddressArgs = {
  address: Scalars["String"];
};

export type Settings = {
  __typename?: "Settings";
  tzStatsUrl: Scalars["String"];
};

export type Subscription = {
  __typename?: "Subscription";
  operationSent?: Maybe<Operation>;
  operationConfirmed?: Maybe<Operation>;
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
  String: ResolverTypeWrapper<Scalars["String"]>;
  ContractStorage: ResolverTypeWrapper<ContractStorage>;
  ContractStorageMeta: ResolverTypeWrapper<ContractStorageMeta>;
  Int: ResolverTypeWrapper<Scalars["Int"]>;
  JSON: ResolverTypeWrapper<Scalars["JSON"]>;
  BigMapKV: ResolverTypeWrapper<BigMapKv>;
  BigMapMeta: ResolverTypeWrapper<BigMapMeta>;
  Boolean: ResolverTypeWrapper<Scalars["Boolean"]>;
  ContractOperation: ResolverTypeWrapper<ContractOperation>;
  Float: ResolverTypeWrapper<Scalars["Float"]>;
  ContractOperationParams: ResolverTypeWrapper<ContractOperationParams>;
  ContractOperationStorage: ResolverTypeWrapper<ContractOperationStorage>;
  ContractOperationStorageMeta: ResolverTypeWrapper<
    ContractOperationStorageMeta
  >;
  BigMapDiffItem: ResolverTypeWrapper<BigMapDiffItem>;
  BigMapDiffItemMeta: ResolverTypeWrapper<BigMapDiffItemMeta>;
  NonFungibleToken: ResolverTypeWrapper<NonFungibleToken>;
  Profile: ResolverTypeWrapper<Profile>;
  PublishedOperation: ResolverTypeWrapper<PublishedOperation>;
  Settings: ResolverTypeWrapper<Settings>;
  Mutation: ResolverTypeWrapper<{}>;
  Subscription: ResolverTypeWrapper<{}>;
  Operation: ResolverTypeWrapper<Operation>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  Query: {};
  String: Scalars["String"];
  ContractStorage: ContractStorage;
  ContractStorageMeta: ContractStorageMeta;
  Int: Scalars["Int"];
  JSON: Scalars["JSON"];
  BigMapKV: BigMapKv;
  BigMapMeta: BigMapMeta;
  Boolean: Scalars["Boolean"];
  ContractOperation: ContractOperation;
  Float: Scalars["Float"];
  ContractOperationParams: ContractOperationParams;
  ContractOperationStorage: ContractOperationStorage;
  ContractOperationStorageMeta: ContractOperationStorageMeta;
  BigMapDiffItem: BigMapDiffItem;
  BigMapDiffItemMeta: BigMapDiffItemMeta;
  NonFungibleToken: NonFungibleToken;
  Profile: Profile;
  PublishedOperation: PublishedOperation;
  Settings: Settings;
  Mutation: {};
  Subscription: {};
  Operation: Operation;
}>;

export type BigMapDiffItemResolvers<
  ContextType = SessionContext,
  ParentType extends ResolversParentTypes["BigMapDiffItem"] = ResolversParentTypes["BigMapDiffItem"]
> = ResolversObject<{
  key?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  key_hash?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  key_binary?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  value?: Resolver<Maybe<ResolversTypes["JSON"]>, ParentType, ContextType>;
  meta?: Resolver<
    Maybe<ResolversTypes["BigMapDiffItemMeta"]>,
    ParentType,
    ContextType
  >;
  action?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
}>;

export type BigMapDiffItemMetaResolvers<
  ContextType = SessionContext,
  ParentType extends ResolversParentTypes["BigMapDiffItemMeta"] = ResolversParentTypes["BigMapDiffItemMeta"]
> = ResolversObject<{
  contract?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  bigmap_id?: Resolver<Maybe<ResolversTypes["Int"]>, ParentType, ContextType>;
  time?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  height?: Resolver<Maybe<ResolversTypes["Int"]>, ParentType, ContextType>;
  block?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
}>;

export type BigMapKvResolvers<
  ContextType = SessionContext,
  ParentType extends ResolversParentTypes["BigMapKV"] = ResolversParentTypes["BigMapKV"]
> = ResolversObject<{
  key?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  key_hash?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  key_binary?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  value?: Resolver<Maybe<ResolversTypes["JSON"]>, ParentType, ContextType>;
  meta?: Resolver<Maybe<ResolversTypes["BigMapMeta"]>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
}>;

export type BigMapMetaResolvers<
  ContextType = SessionContext,
  ParentType extends ResolversParentTypes["BigMapMeta"] = ResolversParentTypes["BigMapMeta"]
> = ResolversObject<{
  contract?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  bigmap_id?: Resolver<Maybe<ResolversTypes["Int"]>, ParentType, ContextType>;
  time?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  height?: Resolver<Maybe<ResolversTypes["Int"]>, ParentType, ContextType>;
  block?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  is_replaced?: Resolver<
    Maybe<ResolversTypes["Boolean"]>,
    ParentType,
    ContextType
  >;
  is_removed?: Resolver<
    Maybe<ResolversTypes["Boolean"]>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
}>;

export type ContractOperationResolvers<
  ContextType = SessionContext,
  ParentType extends ResolversParentTypes["ContractOperation"] = ResolversParentTypes["ContractOperation"]
> = ResolversObject<{
  hash?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  block?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  time?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  height?: Resolver<Maybe<ResolversTypes["Int"]>, ParentType, ContextType>;
  cycle?: Resolver<Maybe<ResolversTypes["Int"]>, ParentType, ContextType>;
  counter?: Resolver<Maybe<ResolversTypes["Int"]>, ParentType, ContextType>;
  op_n?: Resolver<Maybe<ResolversTypes["Int"]>, ParentType, ContextType>;
  op_c?: Resolver<Maybe<ResolversTypes["Int"]>, ParentType, ContextType>;
  op_i?: Resolver<Maybe<ResolversTypes["Int"]>, ParentType, ContextType>;
  status?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  is_success?: Resolver<
    Maybe<ResolversTypes["Boolean"]>,
    ParentType,
    ContextType
  >;
  is_contract?: Resolver<
    Maybe<ResolversTypes["Boolean"]>,
    ParentType,
    ContextType
  >;
  gas_limit?: Resolver<Maybe<ResolversTypes["Int"]>, ParentType, ContextType>;
  gas_used?: Resolver<Maybe<ResolversTypes["Int"]>, ParentType, ContextType>;
  gas_price?: Resolver<Maybe<ResolversTypes["Float"]>, ParentType, ContextType>;
  storage_limit?: Resolver<
    Maybe<ResolversTypes["Int"]>,
    ParentType,
    ContextType
  >;
  storage_size?: Resolver<
    Maybe<ResolversTypes["Int"]>,
    ParentType,
    ContextType
  >;
  storage_paid?: Resolver<
    Maybe<ResolversTypes["Int"]>,
    ParentType,
    ContextType
  >;
  volume?: Resolver<Maybe<ResolversTypes["Int"]>, ParentType, ContextType>;
  fee?: Resolver<Maybe<ResolversTypes["Float"]>, ParentType, ContextType>;
  reward?: Resolver<Maybe<ResolversTypes["Int"]>, ParentType, ContextType>;
  deposit?: Resolver<Maybe<ResolversTypes["Int"]>, ParentType, ContextType>;
  burned?: Resolver<Maybe<ResolversTypes["Int"]>, ParentType, ContextType>;
  is_internal?: Resolver<
    Maybe<ResolversTypes["Boolean"]>,
    ParentType,
    ContextType
  >;
  has_data?: Resolver<
    Maybe<ResolversTypes["Boolean"]>,
    ParentType,
    ContextType
  >;
  days_destroyed?: Resolver<
    Maybe<ResolversTypes["Int"]>,
    ParentType,
    ContextType
  >;
  parameters?: Resolver<
    Maybe<ResolversTypes["ContractOperationParams"]>,
    ParentType,
    ContextType
  >;
  storage?: Resolver<
    Maybe<ResolversTypes["ContractOperationStorage"]>,
    ParentType,
    ContextType
  >;
  big_map_diff?: Resolver<
    Maybe<Array<Maybe<ResolversTypes["BigMapDiffItem"]>>>,
    ParentType,
    ContextType
  >;
  sender?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  receiver?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  branch_id?: Resolver<Maybe<ResolversTypes["Int"]>, ParentType, ContextType>;
  branch_height?: Resolver<
    Maybe<ResolversTypes["Int"]>,
    ParentType,
    ContextType
  >;
  branch_depth?: Resolver<
    Maybe<ResolversTypes["Int"]>,
    ParentType,
    ContextType
  >;
  branch?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
}>;

export type ContractOperationParamsResolvers<
  ContextType = SessionContext,
  ParentType extends ResolversParentTypes["ContractOperationParams"] = ResolversParentTypes["ContractOperationParams"]
> = ResolversObject<{
  entrypoint?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  branch?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes["Int"]>, ParentType, ContextType>;
  value?: Resolver<Maybe<ResolversTypes["JSON"]>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
}>;

export type ContractOperationStorageResolvers<
  ContextType = SessionContext,
  ParentType extends ResolversParentTypes["ContractOperationStorage"] = ResolversParentTypes["ContractOperationStorage"]
> = ResolversObject<{
  meta?: Resolver<
    Maybe<ResolversTypes["ContractOperationStorageMeta"]>,
    ParentType,
    ContextType
  >;
  value?: Resolver<Maybe<ResolversTypes["JSON"]>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
}>;

export type ContractOperationStorageMetaResolvers<
  ContextType = SessionContext,
  ParentType extends ResolversParentTypes["ContractOperationStorageMeta"] = ResolversParentTypes["ContractOperationStorageMeta"]
> = ResolversObject<{
  contract?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  time?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  height?: Resolver<Maybe<ResolversTypes["Int"]>, ParentType, ContextType>;
  block?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
}>;

export type ContractStorageResolvers<
  ContextType = SessionContext,
  ParentType extends ResolversParentTypes["ContractStorage"] = ResolversParentTypes["ContractStorage"]
> = ResolversObject<{
  meta?: Resolver<
    Maybe<ResolversTypes["ContractStorageMeta"]>,
    ParentType,
    ContextType
  >;
  value?: Resolver<Maybe<ResolversTypes["JSON"]>, ParentType, ContextType>;
  fa12BigMap?: Resolver<
    Maybe<Array<Maybe<ResolversTypes["BigMapKV"]>>>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
}>;

export type ContractStorageMetaResolvers<
  ContextType = SessionContext,
  ParentType extends ResolversParentTypes["ContractStorageMeta"] = ResolversParentTypes["ContractStorageMeta"]
> = ResolversObject<{
  contract?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  time?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  height?: Resolver<Maybe<ResolversTypes["Int"]>, ParentType, ContextType>;
  block?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
}>;

export interface JsonScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes["JSON"], any> {
  name: "JSON";
}

export type MutationResolvers<
  ContextType = SessionContext,
  ParentType extends ResolversParentTypes["Mutation"] = ResolversParentTypes["Mutation"]
> = ResolversObject<{
  createProfile?: Resolver<
    ResolversTypes["Profile"],
    ParentType,
    ContextType,
    RequireFields<MutationCreateProfileArgs, "alias" | "address">
  >;
  createNonFungibleToken?: Resolver<
    ResolversTypes["NonFungibleToken"],
    ParentType,
    ContextType,
    RequireFields<
      MutationCreateNonFungibleTokenArgs,
      "token_id" | "creator_address" | "operation_address"
    >
  >;
}>;

export type NonFungibleTokenResolvers<
  ContextType = SessionContext,
  ParentType extends ResolversParentTypes["NonFungibleToken"] = ResolversParentTypes["NonFungibleToken"]
> = ResolversObject<{
  id?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  token_id?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  creator_address?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  operation_address?: Resolver<
    ResolversTypes["String"],
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
}>;

export type OperationResolvers<
  ContextType = SessionContext,
  ParentType extends ResolversParentTypes["Operation"] = ResolversParentTypes["Operation"]
> = ResolversObject<{
  hash?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  time?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
}>;

export type ProfileResolvers<
  ContextType = SessionContext,
  ParentType extends ResolversParentTypes["Profile"] = ResolversParentTypes["Profile"]
> = ResolversObject<{
  id?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  alias?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  address?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
}>;

export type PublishedOperationResolvers<
  ContextType = SessionContext,
  ParentType extends ResolversParentTypes["PublishedOperation"] = ResolversParentTypes["PublishedOperation"]
> = ResolversObject<{
  id?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  address?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  initiator_address?: Resolver<
    ResolversTypes["String"],
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
}>;

export type QueryResolvers<
  ContextType = SessionContext,
  ParentType extends ResolversParentTypes["Query"] = ResolversParentTypes["Query"]
> = ResolversObject<{
  contractStorage?: Resolver<
    Maybe<ResolversTypes["ContractStorage"]>,
    ParentType,
    ContextType,
    RequireFields<QueryContractStorageArgs, "contract_id">
  >;
  contractOperations?: Resolver<
    Maybe<Array<Maybe<ResolversTypes["ContractOperation"]>>>,
    ParentType,
    ContextType,
    RequireFields<QueryContractOperationsArgs, "contract_id">
  >;
  nftByTokenId?: Resolver<
    Maybe<ResolversTypes["NonFungibleToken"]>,
    ParentType,
    ContextType,
    RequireFields<QueryNftByTokenIdArgs, "token_id">
  >;
  nftByCreatorAddress?: Resolver<
    Maybe<ResolversTypes["NonFungibleToken"]>,
    ParentType,
    ContextType,
    RequireFields<QueryNftByCreatorAddressArgs, "creator_address">
  >;
  nftByOperationAddress?: Resolver<
    Maybe<ResolversTypes["NonFungibleToken"]>,
    ParentType,
    ContextType,
    RequireFields<QueryNftByOperationAddressArgs, "operation_address">
  >;
  nftTokens?: Resolver<
    Maybe<Array<Maybe<ResolversTypes["NonFungibleToken"]>>>,
    ParentType,
    ContextType,
    RequireFields<QueryNftTokensArgs, never>
  >;
  profileByAddress?: Resolver<
    Maybe<ResolversTypes["Profile"]>,
    ParentType,
    ContextType,
    RequireFields<QueryProfileByAddressArgs, "address">
  >;
  profileByAlias?: Resolver<
    Maybe<ResolversTypes["Profile"]>,
    ParentType,
    ContextType,
    RequireFields<QueryProfileByAliasArgs, "alias">
  >;
  publishedOperationByAddress?: Resolver<
    Maybe<ResolversTypes["PublishedOperation"]>,
    ParentType,
    ContextType,
    RequireFields<QueryPublishedOperationByAddressArgs, "address">
  >;
  publishedOperationByInitiatorAddress?: Resolver<
    Maybe<ResolversTypes["PublishedOperation"]>,
    ParentType,
    ContextType,
    RequireFields<QueryPublishedOperationByInitiatorAddressArgs, "address">
  >;
  settings?: Resolver<ResolversTypes["Settings"], ParentType, ContextType>;
}>;

export type SettingsResolvers<
  ContextType = SessionContext,
  ParentType extends ResolversParentTypes["Settings"] = ResolversParentTypes["Settings"]
> = ResolversObject<{
  tzStatsUrl?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
}>;

export type SubscriptionResolvers<
  ContextType = SessionContext,
  ParentType extends ResolversParentTypes["Subscription"] = ResolversParentTypes["Subscription"]
> = ResolversObject<{
  operationSent?: SubscriptionResolver<
    Maybe<ResolversTypes["Operation"]>,
    "operationSent",
    ParentType,
    ContextType
  >;
  operationConfirmed?: SubscriptionResolver<
    Maybe<ResolversTypes["Operation"]>,
    "operationConfirmed",
    ParentType,
    ContextType
  >;
}>;

export type Resolvers<ContextType = SessionContext> = ResolversObject<{
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
  Profile?: ProfileResolvers<ContextType>;
  PublishedOperation?: PublishedOperationResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Settings?: SettingsResolvers<ContextType>;
  Subscription?: SubscriptionResolvers<ContextType>;
}>;

/**
 * @deprecated
 * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
 */
export type IResolvers<ContextType = SessionContext> = Resolvers<ContextType>;
