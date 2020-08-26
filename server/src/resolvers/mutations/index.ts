import { Resolvers, MutationResolvers } from '../../generated/graphql_schema';
import { MichelsonMap } from '@taquito/taquito';
import PublishedOperation from '../../models/published_operation';
import { TransactionOperation } from '@taquito/taquito/dist/types/operations/transaction-operation';
import { Context } from '../../components/context';

async function confirmOperation(
  { db, pubsub, tzClient }: Context,
  operation: TransactionOperation
) {
  const constants = await tzClient.rpc.getConstants();
  const pollingInterval: number = Number(constants.time_between_blocks[0]) / 5;
  await operation.confirmation(1, pollingInterval);
  await PublishedOperation.updateStatusByHash(db, operation.hash, 'confirmed');
  const publishedOp = await PublishedOperation.byHash(db, operation.hash);
  pubsub.publish('OPERATION_CONFIRMED', { operationConfirmed: publishedOp });
}

const Mutation: MutationResolvers = {
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
        extras: new MichelsonMap({
          prim: 'map',
          args: [{ prim: 'string' }, { prim: 'string' }]
        })
      }
    ];

    const operation = await minterContract.methods
      .mint(nftContract.address, params)
      .send();

    await PublishedOperation.create(db, {
      hash: operation.hash,
      initiator: adminAddress,
      method: 'mint',
      params: JSON.stringify(params),
      status: 'published',
      retry: false
    });

    const publishedOp = await PublishedOperation.byHash(db, operation.hash);

    if (!publishedOp) throw Error('Failed to return published operation');

    confirmOperation(ctx, operation);

    return publishedOp;
  }
};

const resolvers: Resolvers = {
  Mutation
};

export default resolvers;
