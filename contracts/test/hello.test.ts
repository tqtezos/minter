import { bootstrap } from './bootstrap-sandbox';
import { Tezos } from '@taquito/taquito';
import { $log } from '@tsed/logger';

beforeAll(bootstrap)

describe('balance of', () => {
  it('bootstrap account', async () => {
    Tezos.signer
      .publicKeyHash()
      .then(bootstrapKey => Tezos.tz.getBalance(bootstrapKey))
      .then(balance => $log.debug(`bootstrap account balance ${balance.toNumber() / 1000000} ꜩ`))
      .catch(error => $log.error(JSON.stringify(error)));
  })
})