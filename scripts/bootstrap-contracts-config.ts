import fs from 'fs';
import path from 'path';
import { $log } from '@tsed/logger';
import axios from 'axios';
import retry from 'async-retry';
import Configstore from 'configstore';
import { MichelsonMap, TezosToolkit } from '@taquito/taquito';
import { InMemorySigner } from '@taquito/signer';
import { OriginationOperation } from '@taquito/taquito/dist/types/operations/origination-operation';

// Client & Server Config Generation

function genClientConfig(rootConfig: Configstore) {
  const configPath = path.join(__dirname, `../client/src/config.json`);
  const clientConfig = new Configstore('client', {}, { configPath });
  const clientConfigKeys = ['rpc', 'network', 'bcd', 'ipfs', 'contracts'];

  for (let key of clientConfigKeys) {
    clientConfig.set(key, rootConfig.get(key));
  }
}

function genServerConfig(rootConfig: Configstore) {
  const configPath = path.join(__dirname, `../server/src/config.json`);
  const serverConfig = new Configstore('server', {}, { configPath });
  const serverConfigKeys = ['pinata', 'fleek'];

  for (let key of serverConfigKeys) {
    serverConfig.set(key, rootConfig.get(key));
  }
}

function toHexString(input: string) {
  return Buffer.from(input).toString('hex');
}

export async function originateNftFaucet(
  toolkit: TezosToolkit,
  code: string
): Promise<OriginationOperation> {
  const metadata = new MichelsonMap<string, string>();
  const contents = {
    name: 'Minter',
    description: 'An OpenMinter base collection contract.',
    interfaces: ['TZIP-012', 'TZIP-016', 'TZIP-020'],
    tokenCategory: 'collectibles'
  };
  metadata.set('', toHexString('tezos-storage:contents'));
  metadata.set('contents', toHexString(JSON.stringify(contents)));
  return await toolkit.contract.originate({
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
}

async function exitOnExistingBootstrap(
  config: Configstore,
  toolkit: TezosToolkit,
  configKey: string
): Promise<void> {
  const address = config.get(configKey);
  if (!address) return;

  try {
    await toolkit.contract.at(address);
    $log.info(
      `Contract already exists at address ${address}. Skipping origination`
    );
    process.exit(0);
  } catch (e) {
    return;
  }
}

async function fetchFaucetContractCode() {
  const rawRepoUrl = 'https://raw.githubusercontent.com/tqtezos/minter-sdk';
  const gitHash = '8f67bb8c2abc12b8e6f8e529e1412262972deab3';
  const contractCodeUrl = `${rawRepoUrl}/${gitHash}/contracts/bin/fa2_multi_nft_faucet.tz`;
  const response = await axios.get(contractCodeUrl);
  return { code: response.data, url: contractCodeUrl };
}

async function waitForNetwork(toolkit: TezosToolkit): Promise<void> {
  await retry(async () => await toolkit.rpc.getBlockHeader({ block: '2' }), {
    retries: 8
  });
}

async function createToolkit(config: Configstore): Promise<TezosToolkit> {
  const rpc = config.get('rpc');
  const key = config.get('admin.secret');
  const signer = await InMemorySigner.fromSecretKey(key);
  const toolkit = new TezosToolkit(rpc);
  const providerConfig = { confirmationPollingIntervalSecond: 5 };
  toolkit.setProvider({ signer, rpc, config: providerConfig });
  return toolkit;
}

function readConfig(env: string): Configstore {
  const configFileName = path.join(__dirname, `../config/minter.${env}.json`);
  if (!fs.existsSync(configFileName)) {
    $log.error(`Environment config file ${configFileName} does not exist`);
    process.exit(1);
  }
  return new Configstore('minter', {}, { configPath: configFileName });
}

function readEnv(): string {
  const env = process.env['TZ_NETWORK'];
  if (!env) {
    $log.error(`TZ_NETWORK environment variable is not set`);
    process.exit(1);
  }
  return env;
}

async function bootstrap(env: string) {
  $log.info(`Bootstrapping ${env} environment config...`);
  const configKey = 'contracts.nftFaucet';
  const config = readConfig(env);
  const toolkit = await createToolkit(config);

  $log.info('Connecting to network...');
  await waitForNetwork(toolkit);
  $log.info('Connected');

  // Exit the script if the contract address defined in the configuration
  // already exists on chain
  await exitOnExistingBootstrap(config, toolkit, configKey);

  let contract;
  try {
    const { code, url: contractCodeUrl } = await fetchFaucetContractCode();

    $log.info(`Originating contract from ${contractCodeUrl} ...`);

    const origOp = await originateNftFaucet(toolkit, code);
    contract = await origOp.contract();

    $log.info(`Originated nftFaucet contract at address ${contract.address}`);
    $log.info(`  Consumed gas: ${origOp.consumedGas}`);
  } catch (error) {
    const jsonError = JSON.stringify(error, null, 2);
    $log.error(`nftFaucet origination error ${jsonError}`);
    process.exit(1);
  }

  config.set(configKey, contract.address);
  $log.info(`Updated configuration`);

  genClientConfig(config);
  genServerConfig(config);

  process.exit(0);
}

async function main() {
  const env = readEnv();
  try {
    await bootstrap(env);
  } catch (err) {
    $log.error(`Error while bootstrapping environment ${env}`);
    $log.error(err);
    process.exit(1);
  }
}

main();
