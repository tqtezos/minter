import { bootstrap } from './bootstrap-sandbox';
import { $log } from '@tsed/logger';
import { originate_minter } from './nft-contracts'

describe('initialize', () => {
  let tezos = bootstrap();
  it('origination minter', async () => {
    let admin = await tezos.signer.publicKeyHash();
    return originate_minter(tezos, admin);
  })
})