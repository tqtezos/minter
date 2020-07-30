import { $log } from '@tsed/logger';

import {
  compileAndLoadContract,
  originateContract,
  defaultEnv,
  address,
  Contract
} from './ligo';
import { TezosToolkit, MichelsonMap } from '@taquito/taquito';

export interface MinterTokenMetadata {
  symbol: string;
  name: string;
  owner: address;
  extras: MichelsonMap<string, string>;
}

interface AdminStorage {
  admin: string;
  pending_admin?: string;
  paused: boolean;
}

export interface MinterStorage {
  admin: AdminStorage;
  last_fa2_nft?: address;
  last_created_token_ids: number[];
}

export async function originateMinter(
  tz: TezosToolkit,
  admin: address
): Promise<Contract> {
  const code = await compileAndLoadContract(
    defaultEnv,
    'fa2_nft_minter.mligo',
    'minter_main',
    'fa2_nft_minter.tz'
  );
  const storage = `(Pair (Pair (Pair (Pair "${admin}" False) None) {}) None)`;
  return originateContract(tz, code, storage, 'minter');
}

export interface Fa2TransferDestination {
  to_?: address;
  token_id: number;
  amount: number;
}

export interface Fa2Transfer {
  from_?: address;
  txs: Fa2TransferDestination[];
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

function delay(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms));
}
