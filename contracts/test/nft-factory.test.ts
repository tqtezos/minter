import { $log } from '@tsed/logger';
import { BigNumber } from 'bignumber.js';
import { bootstrap, TestTz } from './bootstrap-sandbox';
import { Contract, nat } from '../src/type-aliases';
import {
  originateNftFactory,
  originateNftFaucet,
  MintNftParam
} from '../src/nft-contracts';
import { TezosToolkit } from '@taquito/taquito';

jest.setTimeout(180000); // 3 minutes

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
  });
});
