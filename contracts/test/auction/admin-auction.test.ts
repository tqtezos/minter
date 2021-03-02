import { $log } from '@tsed/logger';
import { BigNumber } from 'bignumber.js';
import { bootstrap, TestTz } from '../bootstrap-sandbox';
import { Contract, nat, bytes, address } from '../../src/type-aliases';
import {
  originateEnglishAuctionTezAdmin,
  originateNftFactory,
  MintNftParam
} from '../../src/nft-contracts';
import { TezosToolkit, MichelsonMap } from '@taquito/taquito';

import { TransactionOperation } from '@taquito/taquito/dist/types/operations/transaction-operation';
import {
  OpKind,
  OperationContentsAndResultTransaction,
  OperationResultTransaction
} from '@taquito/rpc';
import {addOperator} from '../../src/fa2-interface'
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
  let empty_metadata_map: MichelsonMap<string, bytes>;
  let tokenId : BigNumber;
  let token : MintNftParam;
  let fa2_tokens : Fa2_tokens;
  let auction_tokens : Tokens;

  beforeAll(async () => {
    tezos = await bootstrap();
    $log.info('originating nft factory...');
    nftFactory = await originateNftFactory(tezos.bob);
  });

  beforeEach(async() => {
    $log.info('originating nft auction...');
    nftAuction = await originateEnglishAuctionTezAdmin(tezos.bob);
    nftAuctionBob = await tezos.bob.contract.at(nftAuction.address);
    nftAuctionAlice = await tezos.alice.contract.at(nftAuction.address);

    $log.info('creating nft contract');
    const opCreate = await nftFactory.methods.default('test contract').send();
    await opCreate.confirmation();
    const nftAddress = extractOriginatedContractAddress(opCreate);
    $log.info(`new nft contract is created at ${nftAddress}`);

    $log.info('minting token')
    const nftContract = await tezos.bob.contract.at(nftAddress);

    bobAddress = await tezos.bob.signer.publicKeyHash();
    aliceAddress = await tezos.alice.signer.publicKeyHash();
    empty_metadata_map = new MichelsonMap();

    tokenId = new BigNumber(0);

    token = {
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
    
    fa2_tokens = {
        token_id : tokenId,
        amount : new BigNumber(1)
    }

    auction_tokens = {
        fa2_address : nftAddress,
        fa2_batch : [fa2_tokens]
    }
    
    startTime = new Date();
    startTime.setSeconds(startTime.getSeconds() + 7);
    endTime = new Date(startTime.valueOf());
    endTime.setHours(endTime.getHours() + 1);
    $log.info(`Bob attempts to configure auction`);
    //opening price = 10 tz, percent raise =10, min_raise = 10tz, round_time = 1 hr, extend_time = 5 mins, end_time = start_time + 1hr, 
    const opAuction = await nftAuctionBob.methods.configure(new BigNumber(10000000), new BigNumber(10), new BigNumber(10000000), new BigNumber(3600), new BigNumber(300), [auction_tokens], startTime, endTime).send({amount : 10});
    await opAuction.confirmation();
    $log.info(`Auction configured. Consumed gas: ${opAuction.consumedGas}`);
  });
  test('configuration not from admin should fail', async() => {
    startTime = new Date();
    startTime.setSeconds(startTime.getSeconds() + 7);
    tokenId = tokenId.plus(1);
    $log.info(`Alice attempts to configure auction, we expect it to fail`);
    //opening price = 10 tz, percent raise =10, min_raise = 10tz, round_time = 1 hr, extend_time = 5 mins, end_time = start_time + 1hr, 
    const opAuctionPromise = nftAuctionAlice.methods.configure(new BigNumber(10000000), new BigNumber(10), new BigNumber(10000000), new BigNumber(3600), new BigNumber(300), [auction_tokens], startTime, endTime).send({amount : 10});
    return expect(opAuctionPromise).rejects.toHaveProperty('message', "NOT_AN_ADMIN");
  });  
  test('bid of less than asking price should fail', async() => {
    $log.info(`Alice bids 9tz expecting it to fail`);
    const failedOpeningBid = nftAuctionAlice.methods.bid(0).send({amount : 9});
    return expect(failedOpeningBid).rejects.toHaveProperty('message', 'Bid must raised by at least min_raise_percent of the previous bid or at least opening price if it is the first bid');
  });
  test('place bid meeting opening price and then raise it by valid amount by min_raise_percent', async () => {
    $log.info(`Alice bids 10tz`);
    const opBid = await nftAuctionAlice.methods.bid(0).send({amount : 10});
    await opBid.confirmation();
    $log.info(`Bid placed. Amount sent: ${opBid.amount} mutez`);
    
    $log.info(`Alice bids 11tz, a 10% raise of previous bid but less than a 10tz increase`)
    const opBid2 = await nftAuctionAlice.methods.bid(0).send({amount : 11});
    await opBid2.confirmation();
    $log.info(`Bid placed. Amount sent: ${opBid2.amount} mutez`);
  });

  test('place bid meeting opening price and then raise it by valid amount by min_raise', async () => {
    $log.info(`Alice bids 200tz`);
    const opBid = await nftAuctionAlice.methods.bid(0).send({amount : 200});
    await opBid.confirmation();
    $log.info(`Bid placed. Amount sent: ${opBid.amount} mutez`);
    
    $log.info(`Alice bids 210tz, a 10tz increase but less than a 10% raise of previous bid `)
    const opBid2 = await nftAuctionAlice.methods.bid(0).send({amount : 210});
    await opBid2.confirmation();
    $log.info(`Bid placed. Amount sent: ${opBid2.amount} mutez`);
  });

  test('bid too small should fail', async () => {
    $log.info(`Alice bids 20tz`);
    const opBid = await nftAuctionAlice.methods.bid(0).send({amount : 20});
    await opBid.confirmation();
    $log.info(`Bid placed. Amount sent: ${opBid.amount}`);
    $log.info(`Alice bids 21tz and we expect it to fail`);
    const smallBidPromise = nftAuctionAlice.methods.bid(0).send({amount : 21});
    return expect(smallBidPromise).rejects.toHaveProperty('message', 'Bid must raised by at least min_raise_percent of the previous bid or at least opening price if it is the first bid');
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
