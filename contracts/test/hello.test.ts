import { bootstrap, TestTz } from './bootstrap-sandbox';
import { $log } from '@tsed/logger';
import { TezosToolkit } from '@taquito/taquito';

describe('balance of', () => {
  let tezos: TestTz;

  beforeAll(async () => {
    tezos = await bootstrap();
  });

  test('bootstrap Bob account', async () => {
    tezos.bob.signer
      .publicKeyHash()
      .then(bootstrapKey => tezos.alice.tz.getBalance(bootstrapKey))
      .then(balance =>
        $log.info(`bootstrap account balance ${balance.toNumber() / 1000000} ꜩ`)
      )
      .catch(error => $log.error(JSON.stringify(error)));
  });
});
