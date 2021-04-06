import fs from 'fs';
import path from 'path';
import { $log } from '@tsed/logger';
import axios from 'axios';
import retry from 'async-retry';
import Configstore from 'configstore';
import { MichelsonMap, TezosToolkit } from '@taquito/taquito';
import { InMemorySigner } from '@taquito/signer';

interface BoostrapStorageCallback {
  (): object;
}

interface BootstrapContractParams {
  configKey: string;
  contractFilename: string;
  contractGitHash: string;
  contractAlias: string;
  initStorage: BoostrapStorageCallback;
}

interface ContractCodeResponse {
  code: string;
  url: string;
}

function toHexString(input: string) {
  return Buffer.from(input).toString('hex');
}

export function initStorageNftFaucet() {
  const metadata = new MichelsonMap<string, string>();
  const contents = {
    name: 'Minter',
    description: 'An OpenMinter base collection contract.',
    interfaces: ['TZIP-012', 'TZIP-016', 'TZIP-020'],
    tokenCategory: 'collectibles'
  };
  metadata.set('', toHexString('tezos-storage:contents'));
  metadata.set('contents', toHexString(JSON.stringify(contents)));
  return {
    assets: {
      ledger: new MichelsonMap(),
      next_token_id: 0,
      operators: new MichelsonMap(),
      token_metadata: new MichelsonMap()
    },
    metadata: metadata
  };
}

async function getContractAddress(
  config: Configstore,
  toolkit: TezosToolkit,
  configKey: string
): Promise<string> {
  const existingAddress = config.get(configKey);
  if (!existingAddress) return '';

  return toolkit.contract
    .at(existingAddress)
    .then(() => existingAddress)
    .catch(() => '');
}

async function fetchContractCode(
  contractFilename: string,
  contractGitHash: string
): Promise<ContractCodeResponse> {
  const rawRepoUrl = 'https://raw.githubusercontent.com/tqtezos/minter-sdk';
  const contractCodeUrl = `${rawRepoUrl}/${contractGitHash}/contracts/bin/${contractFilename}`;
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
  const configFileName = path.join(__dirname, `../config/${env}.json`);
  if (!fs.existsSync(configFileName)) {
    $log.error(`Environment config file ${configFileName} does not exist`);
    process.exit(1);
  }
  return new Configstore('minter', {}, { configPath: configFileName });
}

function readBootstrappedConfig(env: string): Configstore {
  const configFileName = path.join(
    __dirname,
    `../config/${env}-bootstrapped.json`
  );
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

async function bootstrapContract(
  config: Configstore,
  toolkit: TezosToolkit,
  params: BootstrapContractParams
): Promise<void> {
  const address = await getContractAddress(config, toolkit, params.configKey);
  if (address) {
    $log.info(
      `${params.contractAlias} contract already exists at address ${address}. Skipping origination.`
    );
    return;
  }

  let contract;
  try {
    const { code, url: contractCodeUrl } = await fetchContractCode(
      params.contractFilename,
      params.contractGitHash
    );

    $log.info(
      `Originating ${params.contractAlias} contract from ${contractCodeUrl} ...`
    );

    const storage = params.initStorage();
    const origOp = await toolkit.contract.originate({
      code: code,
      storage: storage
    });

    contract = await origOp.contract();

    $log.info(
      `Originated ${params.contractAlias} contract at address ${contract.address}`
    );
    $log.info(`  Consumed gas: ${origOp.consumedGas}`);
  } catch (error) {
    const jsonError = JSON.stringify(error, null, 2);
    $log.error(`${params.contractAlias} origination error ${jsonError}`);
    process.exit(1);
  }

  config.set(params.configKey, contract.address);
  $log.info(`Updated configuration`);
}

async function bootstrap(env: string) {
  $log.info(`Bootstrapping ${env} environment config...`);
  const config = readConfig(env);
  const bootstrappedConfig = readBootstrappedConfig(env);
  bootstrappedConfig.all = config.all;
  const toolkit = await createToolkit(config);

  $log.info('Connecting to network...');
  await waitForNetwork(toolkit);
  $log.info('Connected');

  // bootstrap NFT faucet
  await bootstrapContract(bootstrappedConfig, toolkit, {
    configKey: 'contracts.nftFaucet',
    contractAlias: 'nftFaucet',
    contractFilename: 'fa2_multi_nft_faucet.tz',
    contractGitHash: 'aec441412d53653fa0048fee7c12c1eb1365909b',
    initStorage: initStorageNftFaucet
  });

  // bootstrap marketplace fixed price (tez)
  await bootstrapContract(bootstrappedConfig, toolkit, {
    configKey: 'contracts.marketplace.fixedPrice.tez',
    contractAlias: 'fixedPriceMarketTez',
    contractFilename: 'fixed_price_sale_market_tez.tz',
    contractGitHash: '8f67bb8c2abc12b8e6f8e529e1412262972deab3',
    initStorage: () => new MichelsonMap()
  });
}

async function main() {
  console.log(process.argv[2]);
  const envArg = process.argv[2];
  let env;
  if (['mainnet', 'testnet', 'sandbox'].includes(envArg)) {
    env = envArg;
  } else {
    env = readEnv();
  }
  try {
    await bootstrap(env);
    process.exit(0);
  } catch (err) {
    $log.error(`Error while bootstrapping environment ${env}`);
    $log.error(err);
    process.exit(1);
  }
}

main();
