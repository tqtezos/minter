import { Resolvers, QueryResolvers } from '../../generated/graphql_schema';
import { Context } from '../../components/context';
import PublishedOperation from '../../models/published_operation';
import axios from 'axios';
import { contractNames } from './contractNames';
import { nfts } from './nfts';

async function getTzStats(ctx: Context, resource: string) {
  const response = await axios.get(`${ctx.tzStatsApiUrl}/${resource}`);
  return response.data;
}

async function extractNftData(ctx: Context) {
  const nftContract = await ctx.contractStore.nftContract();

  const contractData = await getTzStats(ctx, `contract/${nftContract.address}`);
  const [
    ledgerId,
    operatorsId,
    tokenMetadataId
  ] = contractData.bigmap_ids.sort();

  const getBigMapValues = async (bigMapId: number) =>
    getTzStats(ctx, `bigmap/${bigMapId}/values`);

  const nftData = await getBigMapValues(tokenMetadataId);
  const ownerData = await getBigMapValues(ledgerId);
  return { nftContract, contractData, nftData, ownerData };
}

// This function only works for minter built-in contract.
// It has to be removed or generalized to work with multiple contracts
async function nftByTokenId(token_id: string, ctx: Context) {
  const { nftContract, nftData, ownerData } = await extractNftData(ctx);
  const token = nftData.find((kv: any) => kv.value.token_id === token_id);
  if (!token) return null;
  const owner = ownerData.find((kv: any) => kv.key === token.key);
  if (!owner) return null;
  return {
    contractInfo: { name: 'Minter', address: nftContract.address },
    tokenId: token.value.token_id,
    name: token.value.name,
    symbol: token.value.symbol,
    extras: token.value.extras,
    owner: owner.value
  };
}

const Query: QueryResolvers = {
  async publishedOperationByHash(_parent, { hash }, { db }) {
    const publishedOp = await PublishedOperation.byHash(db, hash);
    return publishedOp || null;
  },

  async nftByTokenId(_parent, { token_id }, ctx) {
    return await nftByTokenId(token_id, ctx);
  },

  async nftByOperation(_parent, { operation_address }, ctx) {
    const opData = await getTzStats(ctx, `op/${operation_address}`);
    const tokenId = opData[0].big_map_diff[0].value.token_id;
    return await nftByTokenId(tokenId, ctx);
  },

  async nfts(_parent, { ownerAddress, contractAddress }, ctx) {
    return nfts(ownerAddress, contractAddress, ctx);
  },

  async contractNames(_parent, { contractOwnerAddress, nftOwnerAddress }, ctx) {
    return contractNames(contractOwnerAddress, nftOwnerAddress, ctx);
  },

  settings(_parent, _args, { tzStatsUrl, configStore, bcdGuiUrl, bcdNetwork }) {
    const config = configStore.all;
    return {
      bcdGuiUrl: bcdGuiUrl,
      bcdNetwork: bcdNetwork,
      tzStatsUrl: tzStatsUrl,
      rpc: config.rpc,
      contracts: config.contracts,
      admin: config.admin
    };
  }
};

const resolvers: Resolvers = {
  Query
};

export default resolvers;
