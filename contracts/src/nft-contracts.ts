import { $log } from '@tsed/logger';

import { compileAndLoadContract, originateContract, defaultEnv } from './ligo';
import { Contract, address } from './type-aliases';
import { TezosToolkit } from '@taquito/taquito';
import { TokenMetadata } from './fa2-interface';

export interface MintNftParam {
  metadata: TokenMetadata;
  owner: address;
}

interface AdminStorage {
  admin: string;
  pending_admin?: string;
  paused: boolean;
}

export async function originateNft(
  tz: TezosToolkit,
  admin: address
): Promise<Contract> {
  const code = await compileAndLoadContract(
    defaultEnv,
    'fa2_multi_nft_asset.mligo',
    'nft_asset_main',
    'fa2_multi_nft_asset.tz'
  );
  const storage = `(Pair (Pair (Pair "${admin}" True) None) (Pair (Pair {} 0) (Pair {} {})))`;
  return originateContract(tz, code, storage, 'nft');
}

export async function originateNftWithHooks(
  tz: TezosToolkit,
  admin: address
): Promise<Contract> {
  const code = await compileAndLoadContract(
    defaultEnv,
    'fa2_multi_nft_asset_with_hooks.mligo',
    'nft_asset_main_with_hooks',
    'fa2_multi_nft_asset_with_hooks.tz'
  );
  const storage = `(Pair (Pair (Pair "${admin}" False) None)\
  (Pair (Pair (Pair {} 0)\
              (Pair {} (Pair (Pair None (Left (Right Unit))) (Pair (Left (Left Unit)) (Left (Left Unit))))))\
        {}))`;
  return originateContract(tz, code, storage, 'nft');
}

// function delay(ms: number) {
//   return new Promise<void>(resolve => setTimeout(resolve, ms));
// }
