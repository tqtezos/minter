import fs from 'fs';
import path from 'path';
import { $log } from '@tsed/logger';
import retry from 'async-retry';
import Configstore from 'configstore';
import { MichelsonMap, TezosToolkit } from '@taquito/taquito';
import { InMemorySigner } from '@taquito/signer';
import {
  Fa2MultiNftFaucetCode,
  FixedPriceSaleMarketTezCode,
  FixedPriceSaleMarketTezCancelOnlyAdminCode,
  FixedPriceSaleMarketTezFixedFeeCancelOnlyAdminCode,
  FixedPriceSaleTezFixedFeeCode
} from '@tqtezos/minter-contracts';

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

interface BoostrapStorageCallback {
  (): object;
}

interface BootstrapContractParams {
  configKey: string;
  contractAlias: string;
  contractCode: object[];
  initStorage: BoostrapStorageCallback;
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
    $log.info(`Originating ${params.contractAlias} contract...`);

    const storage = params.initStorage();
    const origOp = await toolkit.contract.originate({
      code: params.contractCode,
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
    contractCode: Fa2MultiNftFaucetCode.code,
    initStorage: initStorageNftFaucet
  });

  // bootstrap marketplace fixed price (tez)
  const adminOnly = config.get("contractOpts.marketplace.adminOnly");
  const marketplaceFeePercent = config.get("contractOpts.marketplace.fee.percent");
  const marketplaceFeeAddress = config.get("contractOpts.marketplace.fee.address");
  if (marketplaceFeePercent && marketplaceFeeAddress) {
    await bootstrapContract(bootstrappedConfig, toolkit, {
      configKey: 'contracts.marketplace.fixedPrice.tez',
      contractAlias: 'fixedPriceMarketTez',
      contractCode: adminOnly ? FixedPriceSaleTezFixedFeeCode.code : FixedPriceSaleMarketTezFixedFeeCancelOnlyAdminCode.code,
      initStorage: () => ({
        admin: {
          admin: config.get("admin.address"),
          paused: false
        },
        fee: {
          fee_address: marketplaceFeeAddress,
          fee_percent: marketplaceFeePercent
        },
        next_sale_id: 0,
        sales: new MichelsonMap()
      })
    });
  } else {
    await bootstrapContract(bootstrappedConfig, toolkit, {
      configKey: 'contracts.marketplace.fixedPrice.tez',
      contractAlias: 'fixedPriceMarketTez',
      contractCode: adminOnly ? FixedPriceSaleMarketTezCode.code : FixedPriceSaleMarketTezCancelOnlyAdminCode.code,
      initStorage: () => ({
        admin: {
          admin: config.get("admin.address"),
          paused: false
        },
        next_sale_id: 0,
        sales: new MichelsonMap()
      })
    });
  }
}

async function main() {
  console.log(process.argv[2]);
  const envArg = process.argv[2];
  let env;
  if (['mainnet', 'testnet', 'custom', 'sandbox'].includes(envArg)) {
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
