import { bootstrap } from './bootstrap-sandbox';
import { $log } from '@tsed/logger';
import { originate_minter } from './nft-contracts'
import { TezosToolkit } from '@taquito/taquito';

jest.setTimeout(20000);

describe('initialize', async () => {
  let tezos: TezosToolkit;

  beforeAll(async () => {
    tezos = await bootstrap();
  })

  // it('access old contract', async () => {
  //   $log.debug('accessing old contract');
  //   const c = await tezos.contract.at('KT1VH4Pk6DhkR6mpv4nkNNBcEatYnufm6m1Y');
  //   $log.debug(`Got old contract ${c.address}`);
  //   // c.methods
  // })

  it('origination minter', async () => {
    const admin = await tezos.signer.publicKeyHash();
    const contract = await originate_minter(tezos, admin);
    $log.debug(`Contract: ${contract.address}`)
  })
})