import { $log } from '@tsed/logger';
import { BigNumber } from 'bignumber.js';
import { bootstrap, TestTz } from '../bootstrap-sandbox';
import { Contract, nat, bytes, address } from '../../src/type-aliases';
import {
  originateEnglishAuctionTez,
  originateNftFactory,
  MintNftParam
} from '../../src/nft-contracts-tzip16';
import { TezosToolkit, MichelsonMap } from '@taquito/taquito';

import { TransactionOperation } from '@taquito/taquito/dist/types/operations/transaction-operation';
import {
  OpKind,
  OperationContentsAndResultTransaction,
  OperationResultTransaction
} from '@taquito/rpc';
import {addOperator} from '../../src/fa2-tzip16-compat-interface'
import {Fa2_tokens, Tokens } from '../../src/auction-interface'

jest.setTimeout(180000); // 3 minutes

describe('test NFT auction', () => {
  let tezos: TestTz;
  let nftAuction: Contract;
  let nftAuctionBob : Contract;
  let nftAuctionAlice : Contract;
  let nftFactory: Contract;
  let bobAddress : address;
  let aliceAddress : address;
  let startTime : Date;
  let endTime : Date;

  beforeAll(async () => {
    tezos = await bootstrap();
    $log.info('originating nft auction...');
    nftAuction = await originateEnglishAuctionTez(tezos.bob);
    $log.info('originating nft factory...');
    nftFactory = await originateNftFactory(tezos.bob);
  });

  test('configure auction', async () => {
    $log.info('creating test contract');
    const opCreate = await nftFactory.methods.default('test contract').send();
    await opCreate.confirmation();
    const nftAddress = extractOriginatedContractAddress(opCreate);
    $log.info(`new nft contract is created at ${nftAddress}`);

    $log.info('minting token')
    const nftContract = await tezos.bob.contract.at(nftAddress);

    bobAddress = await tezos.bob.signer.publicKeyHash();
    aliceAddress = await tezos.alice.signer.publicKeyHash();
    const empty_metadata_map: MichelsonMap<string, bytes> = new MichelsonMap();

    const tokenId = new BigNumber(0);

    const token: MintNftParam = {
      token_metadata: {
        token_id: tokenId,
        token_metadata_map: empty_metadata_map
      },
      owner: bobAddress
    };
    const opMint = await nftContract.methods.mint([token]).send();
    const hash = await opMint.confirmation();
    $log.info(`Minted tokens. Consumed gas: ${opMint.consumedGas}`);

    $log.info('adding auction contract as operator');
    await addOperator(nftContract.address, tezos.bob, nftAuction.address, tokenId);
    $log.info('Auction contract added as operator');
    
    const fa2_tokens : Fa2_tokens = {
        token_id : tokenId,
        amount : new BigNumber(1)
    }

    const tokens : Tokens = {
        fa2_address : nftAddress,
        fa2_batch : [fa2_tokens]
    }
    
    startTime = new Date()
    startTime.setSeconds(startTime.getSeconds() + 7)
    endTime = new Date(startTime.valueOf())
    endTime.setHours(endTime.getHours() + 1)

    nftAuctionBob = await tezos.bob.contract.at(nftAuction.address);

    //opening price = 10 tz, percent raise = 10, round_time = 1 hr, extend_time = 5 mins, end_time = start_time + 1hr, 
    const opAuction = await nftAuctionBob.methods.configure(new BigNumber(10000000), new BigNumber(10), new BigNumber(3600), new BigNumber(300), [tokens], startTime, endTime).send({amount : 10});
    await opAuction.confirmation();
    $log.info(`Auction configured. Consumed gas: ${opAuction.consumedGas}`);
  });
  test('bid of less than asking price should fail', async() => {
    nftAuctionAlice = await tezos.alice.contract.at(nftAuction.address);
    const failedOpeningBid = nftAuctionAlice.methods.bid(0).send({amount : 9});
    return expect(failedOpeningBid).rejects.toHaveProperty('message', 'Bid must raised by at least min_raise_percent of the previous bid or at least opening price if it is the first bid');
  });
  test('place bid meeting opening price and then raise it by exactly 10%', async () => {
    nftAuctionAlice = await tezos.alice.contract.at(nftAuction.address);
    const opBid = await nftAuctionAlice.methods.bid(0).send({amount : 10});
    await opBid.confirmation();
    $log.info(`Bid placed. Amount sent: ${opBid.amount}`);
    const opBid2 = await nftAuctionAlice.methods.bid(0).send({amount : 11});
    await opBid2.confirmation();
    $log.info(`Bid placed. Amount sent: ${opBid2.amount}`);
  });
  test('bid of same amount as previous bid should fail', async () => {
    const failedBidPromise = nftAuctionAlice.methods.bid(0).send({amount : 11});
    return expect(failedBidPromise).rejects.toHaveProperty('message', 'Bid must raised by at least min_raise_percent of the previous bid or at least opening price if it is the first bid');
  });
});


function extractOriginatedContractAddress(op: TransactionOperation): string {
  const result = op.results[0];
  if (result.kind !== OpKind.TRANSACTION)
    throw new Error(`Unexpected operation result ${result.kind}`);
  const txResult = result as OperationContentsAndResultTransaction;
  if (!txResult.metadata.internal_operation_results)
    throw new Error('Unavailable internal origination operation');
  const internalResult = txResult.metadata.internal_operation_results[0]
    .result as OperationResultTransaction;
  if (!internalResult.originated_contracts)
    throw new Error('Originated contract address is unavailable');

  return internalResult.originated_contracts[0];
}
