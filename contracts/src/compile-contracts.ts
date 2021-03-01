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
    await compileFixedPriceSaleMarketPlaceContract(env);
    await compileFixedPriceSaleTezMarketPlaceContract(env);
    await compileEnglishAuctionTezContract(env);
    await compileEnglishAuctionTezAdminContract(env)
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

async function compileFixedPriceSaleMarketPlaceContract(env: LigoEnv): Promise<void> {
    $log.info('compiling fixed price sale marketplace contract');

    await await compileContract(
        env,
        'fixed_price_sale_market.mligo',
        'fixed_price_sale_main',
        'fixed_price_sale_market.tz'
    );
    $log.info('compiled fixed price sale marketplace contract');
}

async function compileFixedPriceSaleTezMarketPlaceContract(env: LigoEnv): Promise<void> {
    $log.info('compiling fixed price sale (sold in tez) marketplace contract');

    await compileContract(
        env,
        'fixed_price_sale_market_tez.mligo',
        'fixed_price_sale_tez_main',
        'fixed_price_sale_market_tez.tz'
    );
    $log.info('compiled fixed price sale (sold in tez) marketplace contract');
}

async function compileEnglishAuctionTezContract(env: LigoEnv): Promise<void> {
  $log.info('compiling english auction tez contract');

  await compileContract(
      env,
      'english_auction_tez.mligo',
      'english_auction_tez_main',
      'english_auction_tez.tz'
  );
  $log.info('compiled english auction tez contract');
}

async function compileEnglishAuctionTezAdminContract(env: LigoEnv): Promise<void> {
  $log.info('compiling english auction tez contract');

  await compileContract(
      env,
      'english_auction_tez_admin.mligo',
      'english_auction_tez_admin_main',
      'english_auction_tez_admin.tz'
  );
  $log.info('compiled english auction tez admin contract');
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
