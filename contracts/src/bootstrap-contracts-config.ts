import { $log } from '@tsed/logger';
import * as fs from 'fs';
import * as path from 'path';
import retry from 'async-retry';
import Configstore from 'configstore';
import { defaultEnv, originateContract, loadFile } from './ligo';
import { TezosToolkit } from '@taquito/taquito';
import { InMemorySigner } from '@taquito/signer';

async function main() {
  const env = process.env['TZ_NETWORK'];
  if (!env) {
    $log.error(`TZ_NETWORK environment variable is not set`);
    process.exit(1);
  }

  const configFileName = path.join(__dirname, `../config/minter.${env}.json`);
  if (!fs.existsSync(configFileName)) {
    $log.error(`Environment config file ${configFileName} does not exist`);
    process.exit(1);
  }

  try {
    $log.info(`bootstrapping ${env} environment config...`);

    const config = new Configstore(
      'minter',
      {},
      { configPath: configFileName }
    );

    const toolkit = await createToolkit(config);
    await awaitForNetwork(toolkit);

    await bootstrapNft(config, toolkit);
    //add bootstrapping of other contracts here

    process.exit(0);
  } catch (err) {
    $log.error(`error while bootstrapping environment ${env}`);
    $log.error(err);
    process.exit(1);
  }
}

async function bootstrapNft(
  config: Configstore,
  tz: TezosToolkit
): Promise<void> {
  $log.info('bootstrapping NFT contract..');

  const adminAddress = await tz.signer.publicKeyHash();
  const storage = `(Pair (Pair (Pair "${adminAddress}" True) None) (Pair (Pair {} 0) (Pair {} {})))`;
  await bootstrapContract(
    config,
    tz,
    'contracts.nft',
    'fa2_multi_nft_asset.tz',
    storage
  );

  $log.info('bootstrapped NFT contract');
}

async function createToolkit(config: Configstore): Promise<TezosToolkit> {
  const adminKey = config.get('admin.secret');
  if (!adminKey) throw new Error('cannot read admin secret key');
  const signer = await InMemorySigner.fromSecretKey(adminKey);
  const rpc = config.get('rpc');
  if (!rpc) throw new Error('cannot read node rpc');

  const toolkit = new TezosToolkit();
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

async function bootstrapContract(
  config: Configstore,
  tz: TezosToolkit,
  configKey: string,
  contractFilename: string,
  contractStorage: string | object
): Promise<void> {
  const shouldOrig = await shouldOriginate(config, tz, configKey);
  if (!shouldOrig) return;

  $log.info('originating...');
  const codeFilepath = defaultEnv.outFilePath(contractFilename);
  const code = await loadFile(codeFilepath);
  const contract = await originateContract(
    tz,
    code,
    contractStorage,
    configKey
  );
  config.set(configKey, contract.address);
  $log.info('originated');
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

main();
