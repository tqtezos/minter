#!/usr/bin/env node

import * as fs from 'fs';
import { defaultEnv, LigoEnv, compileContract } from './ligo';
import { $log } from '@tsed/logger';

async function main(): Promise<void> {
  try {
    const env = defaultEnv;

    await compileNftFaucetContract(env);
    await compileNftContract(env);
    await compileNftFactoryContract(env);
    // add other contracts here

    process.exit(0);
  } catch (err) {
    $log.error(err);
    process.exit(1);
  }
}

async function compileNftFaucetContract(env: LigoEnv): Promise<void> {
  $log.info('compiling NFT faucet contract');
  await await compileContract(
    env,
    'fa2_multi_nft_faucet.mligo',
    'nft_faucet_main',
    'fa2_multi_nft_faucet.tz'
  );
  $log.info('compiled NFT faucet contract');
}

async function compileNftContract(env: LigoEnv): Promise<void> {
  $log.info('compiling NFT contract');
  await await compileContract(
    env,
    'fa2_multi_nft_asset.mligo',
    'nft_asset_main',
    'fa2_multi_nft_asset.tz'
  );
  $log.info('compiled NFT contract');
}

async function compileNftFactoryContract(env: LigoEnv): Promise<void> {
  $log.info('compiling NFT factory contract');

  prepareNftFactoryContract(env);

  await compileContract(
    env,
    'fa2_nft_factory.mligo',
    'factory_main',
    'fa2_nft_factory.tz'
  );
  $log.info('compiled NFT factory contract');
}

function prepareNftFactoryContract(env: LigoEnv): void {
  const templatePath = env.srcFilePath('fa2_nft_factory.template.mligo');
  const template = fs.readFileSync(templatePath).toString();
  const fs2CodePath = env.outFilePath('fa2_multi_nft_asset.tz');
  const fs2Code = fs.readFileSync(fs2CodePath).toString();

  const factoryCode = template.replace('${code}', fs2Code);
  const factoryPath = env.srcFilePath('fa2_nft_factory.mligo');
  fs.writeFileSync(factoryPath, factoryCode);
}

main();
