import * as fs from 'fs';
import * as path from 'path';
import { $log } from '@tsed/logger';
import axios from 'axios';
import retry from 'async-retry';
import Configstore from 'configstore';
import {
  MichelsonMap,
  TezosToolkit,
  ContractAbstraction,
  ContractProvider
} from '@taquito/taquito';
import { InMemorySigner } from '@taquito/signer';

async function loadFile(fileName: string): Promise<string> {
  return new Promise<string>((resolve, reject) =>
    fs.readFile(fileName, (err, buff) =>
      err ? reject(err) : resolve(buff.toString())
    )
  );
}

function genClientConfig(mainConfig: Configstore) {
  const configPath = path.join(__dirname, `../client/src/config.json`);
  const clientConfig = new Configstore('client', {}, { configPath });

  const clientConfigKeys = ['rpc', 'network', 'bcd', 'ipfs', 'contracts'];

  for (let key of clientConfigKeys) {
    clientConfig.set(key, mainConfig.get(key));
  }
}

function genServerConfig(mainConfig: Configstore) {
  const configPath = path.join(__dirname, `../server/src/config.json`);
  const clientConfig = new Configstore('server', {}, { configPath });

  const clientConfigKeys = ['pinata'];

  for (let key of clientConfigKeys) {
    clientConfig.set(key, mainConfig.get(key));
  }
}

function getEnv(): string {
  const env = process.env['TZ_NETWORK'];
  if (!env) {
    $log.error(`TZ_NETWORK environment variable is not set`);
    process.exit(1);
  }
  return env;
}

function getConfig(env: string): Configstore {
  const configFileName = path.join(__dirname, `../config/minter.${env}.json`);
  if (!fs.existsSync(configFileName)) {
    $log.error(`Environment config file ${configFileName} does not exist`);
    process.exit(1);
  }
  return new Configstore('minter', {}, { configPath: configFileName });
}

function toHexString(input: string) {
  return Buffer.from(input).toString('hex');
}

async function createToolkit(config: Configstore): Promise<TezosToolkit> {
  const key = config.get('admin.secret');
  const signer = await InMemorySigner.fromSecretKey(key);
  const rpc = config.get('rpc');
  if (!rpc) throw new Error('cannot read node rpc');

  const toolkit = new TezosToolkit(rpc);
  toolkit.setProvider({
    signer,
    rpc,
    config: { confirmationPollingIntervalSecond: 5 }
  });
  return toolkit;
}

async function awaitForNetwork(tz: TezosToolkit): Promise<void> {
  $log.info('connecting to network...');

  await retry(async () => await tz.rpc.getBlockHeader({ block: '2' }), {
    retries: 8
  });

  $log.info('connected');
}

export async function originateNftFaucet(
  tz: TezosToolkit,
  code: string
): Promise<ContractAbstraction<ContractProvider>> {
  const name = 'nft_faucet_main';
  const metadata = new MichelsonMap<string, string>();
  const contents = {
    name: 'Minter',
    description: 'An OpenMinter base collection contract.',
    interfaces: ['TZIP-012', 'TZIP-016', 'TZIP-020'],
    tokenCategory: 'collectibles'
  };
  metadata.set('', toHexString('tezos-storage:contents'));
  metadata.set('contents', toHexString(JSON.stringify(contents)));
  try {
    const originationOp = await tz.contract.originate({
      code: code,
      storage: {
        assets: {
          ledger: new MichelsonMap(),
          next_token_id: 0,
          operators: new MichelsonMap(),
          token_metadata: new MichelsonMap()
        },
        metadata: metadata
      }
    });

    const contract = await originationOp.contract();
    $log.info(`originated contract ${name} with address ${contract.address}`);
    $log.info(`consumed gas: ${originationOp.consumedGas}`);
    return Promise.resolve(contract);
  } catch (error) {
    const jsonError = JSON.stringify(error, null, 2);
    $log.fatal(`${name} origination error ${jsonError}`);
    return Promise.reject(error);
  }
}

async function findConfigContract(
  config: Configstore,
  tz: TezosToolkit,
  configKey: string
): Promise<string | null> {
  const address = config.get(configKey);
  if (!address) return null;

  try {
    await tz.contract.at(address);
    return address;
  } catch (e) {
    return null;
  }
}

async function bootstrapNftFaucet(
  config: Configstore,
  tz: TezosToolkit
): Promise<void> {
  const configKey = 'contracts.nftFaucet';
  const configContract = await findConfigContract(config, tz, configKey);
  if (configContract) {
    $log.info(
      `Contract already exists at ${configContract}. Skipping origination...`
    );
    process.exit(0);
  }

  $log.info('originating...');
  const code = (
    await axios.get(
      'https://raw.githubusercontent.com/tqtezos/minter-sdk/8f67bb8c2abc12b8e6f8e529e1412262972deab3/contracts/bin/fa2_multi_nft_faucet.tz?token=AA4RXDSXK4NNKZEJJWX53BTAJECMW'
    )
  ).data;
  const contract = await originateNftFaucet(tz, code);
  config.set(configKey, contract.address);
  $log.info('originated');
}

async function main() {
  const env = getEnv();
  try {
    $log.info(`bootstrapping ${env} environment config...`);

    const config = getConfig(env);
    const toolkit = await createToolkit(config);
    await awaitForNetwork(toolkit);
    await bootstrapNftFaucet(config, toolkit);

    genClientConfig(config);
    genServerConfig(config);

    process.exit(0);
  } catch (err) {
    $log.error(`error while bootstrapping environment ${env}`);
    $log.error(err);
    process.exit(1);
  }
}

main();
