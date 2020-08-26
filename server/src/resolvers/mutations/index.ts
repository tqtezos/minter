import { Resolvers, MutationResolvers } from '../../generated/graphql_schema';
import { MichelsonMap } from '@taquito/taquito';

const Mutation: MutationResolvers = {
  // publish operation to chain
  // write operation to database
  // (async) await confirmation
  //       | update operation in database
  //       | publish operation status update to client
  async createNonFungibleToken(_parent, args, ctx) {
    const { db, contractStore } = ctx;
    const nftContract = await contractStore.nftContract();
    const minterContract = await contractStore.minterContract();
    const adminAddress = await ctx.tzClient.signer.publicKeyHash();

    const params = [
      {
        symbol: args.symbol,
        name: args.name,
        owner: adminAddress,
        extras: new MichelsonMap<string, string>()
      }
    ];

    // ERROR: Operation fails with "NOT_AN_ADMIN" even though the sender address
    //        matches the admin address passed as initial storage during
    //        contract origination
    const operation = await minterContract.methods
      .mint(nftContract.address, params)
      .send();

    return {
      id: 0,
      hash: operation.hash,
      initiator: adminAddress,
      method: 'mint',
      params: JSON.stringify(params),
      status: 'published',
      retry: true
    };
  }
};

const resolvers: Resolvers = {
  Mutation
};

export default resolvers;
