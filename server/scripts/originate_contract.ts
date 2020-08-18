import { importKey } from '@taquito/signer';
import { TezosToolkit } from '@taquito/taquito';
import { readFileSync } from 'fs';
import Configstore from 'configstore';
import path from 'path';

const TEZOS_RPC_URL = 'http://sandbox:20000';
const CONFIG_NAME = 'contract-config.json';
const CONFIG_PATH = path.join(__dirname, '../config/', CONFIG_NAME);

async function main() {
  const [, , originatorPrivateKey, storage, configKey] = process.argv;
  const code: string = readFileSync(0, 'utf-8').toString();

  if (!originatorPrivateKey || !storage) {
    console.error('Usage:');
    console.error(
      '  ts-node originate_contract.ts <originatorPrivateKey> <storage>'
    );
    process.exit(1);
  }

  const Tezos = new TezosToolkit();
  Tezos.setProvider({ rpc: TEZOS_RPC_URL });
  await importKey(Tezos, originatorPrivateKey);

  try {
    const op = await Tezos.contract.originate({ code, init: storage });
    const contract = await op.contract(undefined, 1);
    const config = new Configstore(
      CONFIG_NAME,
      {},
      { configPath: CONFIG_PATH }
    );
    console.log(`Originated ${configKey} at ${contract.address}`);
    config.set(configKey, contract.address);
    console.log(`Updated config at server/config/${CONFIG_NAME}`);
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
}

main();
