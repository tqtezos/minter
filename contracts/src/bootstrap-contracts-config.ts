// TODO: This module should be moved away from the `contracts/` folder and split
//       into an SDK command line utility that:
//         - Originates a default OpenMinter contract
//         - Generates client and server configuration
import { $log } from '@tsed/logger';
import * as fs from 'fs';
import * as path from 'path';
import retry from 'async-retry';
import Configstore from 'configstore';
import { defaultEnv, loadFile } from './ligo';
import { MichelsonMap, TezosToolkit } from '@taquito/taquito';
import { OriginateParams } from '@taquito/taquito/dist/types/operations/types';
import { InMemorySigner } from '@taquito/signer';
import { Contract } from './type-aliases';

interface OriginateCallback {
  (tz: TezosToolkit, code: string): Promise<Contract>
}

interface BootstrapContractParams {
  configKey: string;
  contractFilename: string;
  originate: OriginateCallback;
}

function genClientConfig(mainConfig: Configstore) {
  const configPath = path.join(__dirname, `../../client/src/config.json`);
  const clientConfig = new Configstore('client', {}, { configPath });

  const clientConfigKeys = ['rpc', 'network', 'bcd', 'ipfs', 'contracts'];

  for (let key of clientConfigKeys) {
    clientConfig.set(key, mainConfig.get(key));
  }
}

function genServerConfig(mainConfig: Configstore) {
  const configPath = path.join(__dirname, `../../server/src/config.json`);
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

  await retry(
    async () => {
      await tz.rpc.getBlockHeader({ block: '2' });
    },
    { retries: 8 }
  );

  $log.info('connected');
}

async function shouldOriginate(
  config: Configstore,
  tz: TezosToolkit,
  configKey: string
): Promise<boolean> {
  const existingAddress = config.get(configKey);
  if (!existingAddress) return true;

  return tz.contract
    .at(existingAddress)
    .then(() => false)
    .catch(() => true);
}

async function originate(
  tz: TezosToolkit,
  name: string,
  params: OriginateParams
): Promise<Contract> {
  try {
    const originationOp = await tz.contract.originate(params);

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

export async function originateNftFaucet(
  tz: TezosToolkit,
  code: string
): Promise<Contract> {
  const metadata = new MichelsonMap<string, string>();
  const contents = {
    name: 'Minter',
    description: 'An OpenMinter base collection contract.',
    interfaces: ['TZIP-012', 'TZIP-016', 'TZIP-020'],
    tokenCategory: 'collectibles'
  };
  metadata.set('', toHexString('tezos-storage:contents'));
  metadata.set('contents', toHexString(JSON.stringify(contents)));
  return originate(tz, 'nft_faucet_main', {
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

async function originateFixedPriceMarketTez(
  tz: TezosToolkit,
  code: string
): Promise<Contract> {
  return originate(tz, 'fixed_price_sale_market_tez', {
    code: code,
    storage: new MichelsonMap()
  });
}

async function bootstrapContract(
  config: Configstore,
  tz: TezosToolkit,
  params: BootstrapContractParams
): Promise<void> {
  const shouldOrig = await shouldOriginate(config, tz, params.configKey);
  if (!shouldOrig) return;

  $log.info('originating...');
  const codeFilepath = defaultEnv.outFilePath(params.contractFilename);
  const code = await loadFile(codeFilepath);
  const contract = await params.originate(tz, code);
  config.set(params.configKey, contract.address);
  $log.info('originated');
}

async function main() {
  const env = getEnv();
  try {
    $log.info(`bootstrapping ${env} environment config...`);

    const config = getConfig(env);
    const toolkit = await createToolkit(config);
    await awaitForNetwork(toolkit);

    // bootstrap NFT faucet
    await bootstrapContract(config, toolkit, {
      configKey: 'contracts.nftFaucet',
      contractFilename: 'fa2_multi_nft_faucet.tz',
      originate: originateNftFaucet
    });

    // bootstrap marketplace fixed price (tez)
    await bootstrapContract(config, toolkit, {
      configKey: 'contracts.marketplace.fixedPrice.tez',
      contractFilename: 'fixed_price_sale_market_tez.tz',
      originate: originateFixedPriceMarketTez
    });

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
