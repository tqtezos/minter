import { importKey } from '@taquito/signer';
import { TezosToolkit } from '@taquito/taquito';
import { readFileSync } from 'fs';

const TEZOS_RPC_URL = process.env.TEZOS_RPC_URL || 'http://localhost:20000';

async function main() {
  const [, , originatorPrivateKey, storage] = process.argv;
  const code: string = readFileSync(0).toString();

  if (!originatorPrivateKey || !storage) {
    console.error('Usage:');
    console.error(
      '  ts-node originate_contract.ts <originatorPrivateKey> <storage>'
    );
  }

  const Tezos = new TezosToolkit();
  Tezos.setProvider({ rpc: TEZOS_RPC_URL });
  await importKey(Tezos, originatorPrivateKey);

  try {
    const op = await Tezos.contract.originate({ code, init: storage });
    const contract = await op.contract(undefined, 1);
    console.log(contract.address);
  } catch (e) {
    console.log(e);
  }
}

main();
