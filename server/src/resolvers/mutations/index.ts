import { Resolvers, MutationResolvers } from '../../generated/graphql_schema';
import { MichelsonMap } from '@taquito/taquito';
import PublishedOperation from '../../models/published_operation';
import { TransactionOperation } from '@taquito/taquito/dist/types/operations/transaction-operation';
import { Context } from '../../components/context';
import { BigNumber } from 'bignumber.js';
import CID from 'cids';

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

function validateCID(cid: string) {
  try {
    new CID(cid);
  } catch (e) {
    throw Error('The supplied `ipfs_cid` is invalid');
  }
}

const Mutation: MutationResolvers = {
  async createNonFungibleToken(_parent, args, ctx) {
    validateCID(args.ipfs_cid);

    const { db, contractStore } = ctx;
    const nftContract = await contractStore.nftContract();
    const nftStorage = await nftContract.storage<any>();
    const adminAddress = await ctx.tzClient.signer.publicKeyHash();

    const extras = new MichelsonMap({
      prim: 'map',
      args: [{ prim: 'string' }, { prim: 'string' }]
    });

    extras.set('description', args.description);
    extras.set('ipfs_cid', args.ipfs_cid);

    const params = [
      {
        metadata: {
          token_id: nftStorage.assets.next_token_id,
          symbol: args.symbol,
          name: args.name,
          decimals: new BigNumber(0),
          extras
        },
        owner: adminAddress
      }
    ];

    const operation = await nftContract.methods.mint(params).send();

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
