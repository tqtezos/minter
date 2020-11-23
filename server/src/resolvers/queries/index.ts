import { Resolvers, QueryResolvers, OperationStatusType } from '../../generated/graphql_schema';
import PublishedOperation from '../../models/published_operation';
import { contractNames } from './contractNames';
import { nfts } from './nfts';
import { mkBetterCallDev } from './betterCallDev';

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

  async contractOperationStatus(_parent, { contractAddress, hash }, ctx) {
    const bcd = mkBetterCallDev(ctx.bcdApiUrl, ctx.bcdNetwork);
    const op = await bcd.contractOperation(contractAddress, hash)
    
    return op ? {
      status: op.status === 'applied' ? OperationStatusType.Applied : OperationStatusType.Failed,
      timestamp: op.timestamp,
      error: op.errors && op.errors.length > 0 ? op.errors[0] : undefined
    } : null;
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
