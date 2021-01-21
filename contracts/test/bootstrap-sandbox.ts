import { TezosToolkit } from '@taquito/taquito';
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

async function testnetKeys(): Promise<TestKeys> {
  const bob = await InMemorySigner.fromSecretKey(
    'edskRfLsHb49bP4dTpYzAZ7qHCX4ByK2g6Cwq2LWqRYAQSeRpziaZGBW72vrJnp1ahLGKd9rXUf7RHzm8EmyPgseUi3VS9putT'
  );
  const alice = await InMemorySigner.fromSecretKey(
    'edskRqb8GgnD4d2B7nR3ofJajDU7kwooUzXz7yMwRdLDP9j7Z1DvhaeBcs8WkJ4ELXXJgVkq5tGwrFibojDjYVaG7n4Tq1qDxZ'
  );
  return { bob, alice };
}

export type TestTz = {
  bob: TezosToolkit;
  alice: TezosToolkit;
};

export type TestTzMarket = {
  bob: TezosToolkit;
  alice: TezosToolkit;
  market: TezosToolkit;
};

function signerToToolkit(signer: Signer, rpc: string): TezosToolkit {
  const tezos = new TezosToolkit(rpc);
  tezos.setProvider({
    signer,
    rpc,
    config: { confirmationPollingIntervalSecond: 3 }
  });
  return tezos;
}

export async function bootstrap(): Promise<TestTz> {
  const { bob, alice } = await flextesaKeys();
  const rpc = 'http://localhost:8732';
  return {
    bob: signerToToolkit(bob, rpc),
    alice: signerToToolkit(alice, rpc)
  };
}

export async function bootstrapTestnet(): Promise<TestTz> {
  const { bob, alice } = await testnetKeys();
  const rpc = 'https://testnet-tezos.giganode.io';
  return {
    bob: signerToToolkit(bob, rpc),
    alice: signerToToolkit(alice, rpc)
  };
}
