import { $log } from '@tsed/logger';
import * as fs from 'fs';
import * as path from 'path';
import retry from 'async-retry';
import Configstore from 'configstore';
import { defaultEnv } from './ligo';
import { TezosToolkit } from '@taquito/taquito';
import { InMemorySigner } from '@taquito/signer';

async function main() {
  const env = process.env['ENV_NAME'];
  if (!env) {
    $log.error(`ENV_NAME environment variable is not set`);
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
      await tz.rpc.getBlockHeader({ block: '1' });
    },
    { retries: 6 }
  );

  $log.info('connected');
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

async function bootstrapContract(
  config: Configstore,
  tz: TezosToolkit,
  configKey: string,
  contractFilename: string,
  contractStorage: string | object
): Promise<void> {}

main();
