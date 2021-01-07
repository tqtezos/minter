import { $log } from '@tsed/logger';
import * as fs from 'fs';
import * as path from 'path';
import retry from 'async-retry';
import Configstore from 'configstore';
import { defaultEnv, originateContract, loadFile } from './ligo';
import { TezosToolkit } from '@taquito/taquito';
import { InMemorySigner } from '@taquito/signer';
import { sandboxBootstrapKey, testnetBootstrapKey } from './bootstrap-keys';

async function main() {
    const env = getEnv();
    const bootstrapKey = getBootstrapKey(env);
    try {
        $log.info(`bootstrapping ${env} environment config...`);

        const config = getConfig(env);
        const toolkit = await createToolkit(config, bootstrapKey);
        await awaitForNetwork(toolkit);

        await bootstrapNftFaucet(config, toolkit);
        await bootstrapNftFactory(config, toolkit);
        //add bootstrapping of other contracts here

        process.exit(0);
    } catch (err) {
        $log.error(`error while bootstrapping environment ${env}`);
        $log.error(err);
        process.exit(1);
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

function getBootstrapKey(env: string): string {
    if (env === 'sandbox') return sandboxBootstrapKey;
    if (env === 'testnet') return testnetBootstrapKey;
    throw new Error(`unsupported env ${env}`);
}

async function bootstrapNftFaucet(
    config: Configstore,
    tz: TezosToolkit
): Promise<void> {
    $log.info('bootstrapping NFT faucet contract..');

    const storage = `(Pair (Pair {} 0) (Pair {} {}))`;
    await bootstrapContract(
        config,
        tz,
        'contracts.nftFaucet',
        'fa2_multi_nft_faucet.tz',
        storage
    );

    $log.info('bootstrapped NFT faucet contract');
}

async function bootstrapNftFactory(
    config: Configstore,
    tz: TezosToolkit
): Promise<void> {
    $log.info('bootstrapping NFT factory contract..');

    await bootstrapContract(
        config,
        tz,
        'contracts.nftFactory',
        'fa2_nft_factory.tz',
        '{}'
    );

    $log.info('bootstrapped NFT factory contract');
}

async function createToolkit(
    config: Configstore,
    key: string
): Promise<TezosToolkit> {
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
