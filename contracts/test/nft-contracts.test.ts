import { bootstrap } from './bootstrap-sandbox';
import { $log } from '@tsed/logger';
import { Contract, originate_minter, originate_nft } from './nft-contracts'
import { TezosToolkit } from '@taquito/taquito';

jest.setTimeout(20000);

describe('initialize', () => {
  let tezos: TezosToolkit;
  let minter: Contract;
  let nft: Contract;

  beforeAll(async () => {
    tezos = await bootstrap();
  })

  beforeEach(async () => {
    const admin = await tezos.signer.publicKeyHash();
    minter = await originate_minter(tezos, admin);
    nft = await originate_nft(tezos, minter.address);
  })

  test('check origination', () => {
    $log.debug(`minter ${minter.address}`);
    $log.debug(`nft ${nft.address}`);
  })

})
