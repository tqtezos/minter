import { $log } from '@tsed/logger';
import { BigNumber } from 'bignumber.js';
import { bootstrap, TestTz } from '../bootstrap-sandbox';
import { Contract, nat, bytes } from '../../src/type-aliases';
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
  let nftFactory: Contract;

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

    const bobAddress = await tezos.bob.signer.publicKeyHash();
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
    
    const opAuction = await nftAuction.methods.configure(new BigNumber(10), new BigNumber(1), new BigNumber(360), [tokens], new BigNumber(3600), "2020-02-12T10:10:10Z" ).send({amount : 0,  });
    await opAuction.confirmation();
    $log.info(`Auction configured. Consumed gas: ${opAuction.consumedGas}`);

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
