import { Resolvers, QueryResolvers } from "../../generated/graphql_schema";
import { SessionContext } from "../../components/context";
import axios from "axios";
import NonFungibleToken from "../../models/non_fungible_token";
import Profile from "../../models/profile";
import PublishedOperation from "../../models/published_operation";

const getTzStats = async (ctx: SessionContext, resource: string) =>
  (await axios.get(`${ctx.tzStatsApiUrl}/${resource}`)).data;

const Query: QueryResolvers = {
  contractStorage(_parent, { contract_id }, ctx) {
    return getTzStats(ctx, `contract/${contract_id}/storage`);
  },

  contractOperations(_parent, { contract_id }, ctx) {
    return getTzStats(ctx, `contract/${contract_id}/calls?order=desc`);
  },

  async nftByTokenId(_parent, { token_id }, { db }) {
    const nft = await NonFungibleToken.byTokenId(db, token_id);
    return nft || null;
  },

  async nftByCreatorAddress(_parent, { creator_address }, { db }) {
    const nft = await NonFungibleToken.byCreatorAddress(db, creator_address);
    return nft || null;
  },

  async nftByOperationAddress(_parent, { operation_address }, { db }) {
    const nft = await NonFungibleToken.byOperationAddress(
      db,
      operation_address
    );
    return nft || null;
  },

  async nftTokens(_parent, { limit }, { db }) {
    const nfts = await NonFungibleToken.all(db).limit(limit || 20);
    return nfts;
  },

  async profileByAlias(_parent, { alias }, { db }) {
    const profile = await Profile.byAlias(db, alias);
    return profile || null;
  },

  async profileByAddress(_parent, { address }, { db }) {
    const profile = await Profile.byAlias(db, address);
    return profile || null;
  },

  async publishedOperationByAddress(_parent, { address }, { db }) {
    const publishedOperation = await PublishedOperation.byAddress(db, address);
    return publishedOperation || null;
  },

  async publishedOperationByInitiatorAddress(_parent, { address }, { db }) {
    const publishedOperation = await PublishedOperation.byInitiatorAddress(
      db,
      address
    );
    return publishedOperation || null;
  },

  settings(_parent, _args, { tzStatsUrl }) {
    return { tzStatsUrl };
  }
};

const resolvers: Resolvers = {
  Query
};

export default resolvers;
