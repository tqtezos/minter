#!/usr/bin/env node

import { defaultEnv, LigoEnv, compileContract } from './ligo';
import { $log } from '@tsed/logger';

async function main(): Promise<number> {
  try {
    const env = defaultEnv;

    await compileNftContract(env);
    // add other contracts here

    return 0;
  } catch (err) {
    $log.error(err);
    return 1;
  }
}

async function compileNftContract(env: LigoEnv): Promise<void> {
  $log.info('compiling NFT contract');
  await await compileContract(
    defaultEnv,
    'fa2_multi_nft_asset.mligo',
    'nft_asset_main',
    'fa2_multi_nft_asset.tz'
  );
  $log.info('compiled NFT contract');
}

main();
