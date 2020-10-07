import { $log } from '@tsed/logger';
import { BigNumber } from 'bignumber.js';
import { bootstrap, TestTz } from './bootstrap-sandbox';
import { Contract, nat } from '../src/type-aliases';
import {
  originateNftFactory,
  originateNftFaucet,
  MintNftParam
} from '../src/nft-contracts';
import { TezosToolkit, MichelsonMap } from '@taquito/taquito';

import { TransactionOperation } from '@taquito/taquito/dist/types/operations/transaction-operation';
import {
  OpKind,
  OperationContentsAndResult,
  OperationContentsAndResultTransaction,
  OperationResultTransaction
} from '@taquito/rpc';

jest.setTimeout(180000); // 3 minutes

// function instanceOfOperationContentsAndResultTransaction(
//   r: OperationContentsAndResult
// ): object is OperationContentsAndResultTransaction {
//   return r.kind === OpKind.TRANSACTION;
// }

describe('test NFT factory', () => {
  let tezos: TestTz;
  let nftFactory: Contract;

  beforeAll(async () => {
    tezos = await bootstrap();
  });

  beforeEach(async () => {
    $log.info('originating nft factory...');
    nftFactory = await originateNftFactory(tezos.bob);
  });

  test('create contract', async () => {
    $log.info('create contract');

    const op = await nftFactory.methods.main('test contract').send();
    await op.confirmation();
    const nftAddress = extractOriginatedContractAddress(op);
    const nftContract = await tezos.bob.contract.at(nftAddress);
    $log.info(`new nft contract is created at ${nftAddress}`);
  });

  test('mint token', async () => {
    $log.info('create factory');
    const opCreate = await nftFactory.methods.main('test contract').send();
    await opCreate.confirmation();
    const nftAddress = extractOriginatedContractAddress(opCreate);
    $log.info(`new nft contract is created at ${nftAddress}`);
    const nftContract = await tezos.bob.contract.at(nftAddress);

    const bobAddress = await tezos.bob.signer.publicKeyHash();
    const token: MintNftParam = {
      metadata: {
        token_id: new BigNumber(0),
        symbol: 'TK1',
        name: 'A token',
        decimals: new BigNumber(0),
        extras: new MichelsonMap<string, string>()
      },
      owner: bobAddress
    };
    const opMint = await nftContract.methods.mint([token]).send();
    const hash = await opMint.confirmation();
    $log.info(`Minted tokens. Consumed gas: ${opMint.consumedGas}`);
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
