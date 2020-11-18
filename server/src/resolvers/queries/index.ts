import { Resolvers, QueryResolvers } from '../../generated/graphql_schema';
import PublishedOperation from '../../models/published_operation';
import { contractNames } from './contractNames';
import { nfts, nftExists } from './nfts';

const Query: QueryResolvers = {
  async publishedOperationByHash(_parent, { hash }, { db }) {
    const publishedOp = await PublishedOperation.byHash(db, hash);
    return publishedOp || null;
  },

  async nfts(_parent, { ownerAddress, contractAddress }, ctx) {
    return nfts(ownerAddress, contractAddress, ctx);
  },

  async contractNames(_parent, { contractOwnerAddress, nftOwnerAddress }, ctx) {
    return contractNames(contractOwnerAddress, nftOwnerAddress, ctx);
  },

  async nftExists(_parent, { contractAddress, tokenId }, ctx) {
    return nftExists(contractAddress, tokenId, ctx);
  },

  settings(_parent, _args, { configStore, bcdGuiUrl, bcdNetwork }) {
    const config = configStore.all;
    return {
      bcdGuiUrl: bcdGuiUrl,
      bcdNetwork: bcdNetwork,
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
