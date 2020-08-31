import { Resolvers, QueryResolvers } from '../../generated/graphql_schema';
import { Context } from '../../components/context';
import PublishedOperation from '../../models/published_operation';
import axios from 'axios';

async function getTzStats(ctx: Context, resource: string) {
  const response = await axios.get(`${ctx.tzStatsApiUrl}/${resource}`);
  return response.data;
}

async function extractNftData(ctx: Context) {
  const nftContract = await ctx.contractStore.nftContract();
  const contractResource = `contract/${nftContract.address}`;
  const contractData = await getTzStats(ctx, contractResource);
  const nftResource = `bigmap/${contractData.bigmap_ids[0]}/values`;
  const nftData = await getTzStats(ctx, nftResource);
  const ownerResource = `bigmap/${contractData.bigmap_ids[2]}/values`;
  const ownerData = await getTzStats(ctx, ownerResource);
  return { nftContract, contractData, nftData, ownerData };
}

const Query: QueryResolvers = {
  async publishedOperationByHash(_parent, { hash }, { db }) {
    const publishedOp = await PublishedOperation.byHash(db, hash);
    return publishedOp || null;
  },

  // TODO: Convert to indexer API getters
  async nftByTokenId(_parent, { token_id }, ctx) {
    const { nftData, ownerData } = await extractNftData(ctx);
    const token = nftData.find((kv: any) => kv.value.token_id === token_id);
    if (!token) return null;
    const owner = ownerData.find((kv: any) => kv.key === token.key);
    if (!owner) return null;
    return {
      name: token.value.name,
      symbol: token.value.symbol,
      token_id: token.value.token_id,
      extras: token.value.extras,
      decimals: parseInt(token.value.decimals),
      owner: owner.value
    };
  },

  // TODO: Implement paging/limiting - tzindex API supports query params that
  // enable this behavior
  async nfts(_parent, _args, ctx) {
    const { nftData, ownerData } = await extractNftData(ctx);
    return nftData.map((token: any) => ({
      name: token.value.name,
      symbol: token.value.symbol,
      token_id: token.value.token_id,
      extras: token.value.extras,
      decimals: parseInt(token.value.decimals),
      owner: ownerData.find((kv: any) => kv.key === token.key)
    }));
  },

  settings(_parent, _args, { tzStatsUrl }) {
    return { tzStatsUrl };
  }
};

const resolvers: Resolvers = {
  Query
};

export default resolvers;
