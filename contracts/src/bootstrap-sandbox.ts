import { TezosToolkit, Tezos } from '@taquito/taquito';
import { Signer } from '@taquito/taquito/dist/types/signer/interface';
import { InMemorySigner } from '@taquito/signer';
import { $log } from '@tsed/logger';

type TestKeys = {
  bob: Signer;
  alice: Signer;
};

async function flextesaKeys(): Promise<TestKeys> {
  const bob = await InMemorySigner.fromSecretKey(
    'edsk3RFgDiCt7tWB2oe96w1eRw72iYiiqZPLu9nnEY23MYRp2d8Kkx'
  );
  const alice = await InMemorySigner.fromSecretKey(
    'edsk3QoqBuvdamxouPhin7swCvkQNgq4jP5KZPbwWNnwdZpSpJiEbq'
  );
  return { bob, alice };
}

export type TestTz = {
  bob: TezosToolkit;
  alice: TezosToolkit;
};

function signerToToolkit(signer: Signer): TezosToolkit {
  const tezos = new TezosToolkit();
  tezos.setProvider({
    signer,
    rpc: 'http://localhost:20000',
    config: { confirmationPollingIntervalSecond: 3 }
  });
  return tezos;
}

export async function bootstrap(): Promise<TestTz> {
  const { bob, alice } = await flextesaKeys();
  return {
    bob: signerToToolkit(bob),
    alice: signerToToolkit(alice)
  };
}
