import { bootstrap } from './bootstrap-sandbox';
import { $log } from '@tsed/logger';
import { TezosToolkit } from '@taquito/taquito';

describe('balance of', () => {
  let tezos: TezosToolkit;

  beforeAll(async () => {
    tezos = await bootstrap();
  })

  test('bootstrap account', async () => {
    tezos.signer
      .publicKeyHash()
      .then(bootstrapKey => tezos.tz.getBalance(bootstrapKey))
      .then(balance => $log.info(`bootstrap account balance ${balance.toNumber() / 1000000} ꜩ`))
      .catch(error => $log.error(JSON.stringify(error)));
  })
})