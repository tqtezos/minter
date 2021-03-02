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
    await compileFtFaucetContract(env);
    await compileFtContract(env);
    await compileFixedPriceSaleMarketPlaceWithAdminContract(env);
    await compileFixedPriceSaleTezMarketPlaceWithAdminContract(env);
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


async function compileFtFaucetContract(env: LigoEnv): Promise<void> {
  $log.info('compiling FT faucet contract');
  await await compileContract(
    env,
    'fa2_multi_ft_faucet.mligo',
    'ft_faucet_main',
    'fa2_multi_ft_faucet.tz'
  );
  $log.info('compiled FT faucet contract');
}

async function compileFtContract(env: LigoEnv): Promise<void> {
  $log.info('compiling FT contract');
  await await compileContract(
    env,
    'fa2_multi_ft_asset.mligo',
    'multi_ft_asset_main',
    'fa2_multi_ft_asset.tz'
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

async function compileFixedPriceSaleMarketPlaceWithAdminContract(env: LigoEnv): Promise<void> {
    $log.info('compiling fixed price sale marketplace (with admin) contract');

    await await compileContract(
        env,
        'fixed_price_sale_market_with_admin.mligo',
        'fixed_price_sale_main',
        'fixed_price_sale_market_with_admin.tz'
    );
    $log.info('compiled fixed price sale marketplace (with admin) contract');
}

async function compileFixedPriceSaleTezMarketPlaceWithAdminContract(env: LigoEnv): Promise<void> {
    $log.info('compiling fixed price sale (sold in tez) marketplace (with admin) contract');

    await compileContract(
        env,
        'fixed_price_sale_market_tez_with_admin.mligo',
        'fixed_price_sale_tez_main',
        'fixed_price_sale_market_tez_with_admin.tz'
    );
    $log.info('compiled fixed price sale (sold in tez) marketplace (with admin) contract');
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
