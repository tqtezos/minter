import { Resolvers, QueryResolvers } from '../../generated/graphql_schema';
import { SessionContext } from '../../components/context';
import axios from 'axios';
import NonFungibleToken from '../../models/non_fungible_token';
import PublishedOperation from '../../models/published_operation';

const getTzStats = async (ctx: SessionContext, resource: string) =>
  (await axios.get(`${ctx.tzStatsApiUrl}/${resource}`)).data;

const Query: QueryResolvers = {
  async publishedOperationByHash(_parent, { hash }, { db }) {
    const publishedOp = await PublishedOperation.byHash(db, hash);
    return publishedOp || null;
  },

  // TODO: Convert to indexer API getters
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

  settings(_parent, _args, { tzStatsUrl }) {
    return { tzStatsUrl };
  }
};

const resolvers: Resolvers = {
  Query
};

export default resolvers;
