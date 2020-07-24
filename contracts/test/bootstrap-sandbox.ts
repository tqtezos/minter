import { TezosToolkit, Tezos } from '@taquito/taquito';
import { InMemorySigner, importKey } from '@taquito/signer';
import { $log } from '@tsed/logger'


export async function bootstrap(): Promise<TezosToolkit> {
  const tezos = new TezosToolkit();
  const testAccountKey = 'edsk3RFgDiCt7tWB2oe96w1eRw72iYiiqZPLu9nnEY23MYRp2d8Kkx';
  const signer = await InMemorySigner.fromSecretKey(testAccountKey);
  tezos.setProvider({
    signer,
    rpc: 'http://localhost:20000',
  });
  // await importKey(tezos, testAccountKey);
  $log.debug("Flextesa Tezos is setup");
  return Promise.resolve(tezos);
}

