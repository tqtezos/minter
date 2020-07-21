import { bootstrap } from './bootstrap-sandbox';
import { $log } from '@tsed/logger';

beforeAll(bootstrap)

describe('balance of', () => {
  const tezos = bootstrap();
  it('bootstrap account', async () => {
    tezos.signer
      .publicKeyHash()
      .then(bootstrapKey => tezos.tz.getBalance(bootstrapKey))
      .then(balance => $log.debug(`bootstrap account balance ${balance.toNumber() / 1000000} ꜩ`))
      .catch(error => $log.error(JSON.stringify(error)));
  })
})