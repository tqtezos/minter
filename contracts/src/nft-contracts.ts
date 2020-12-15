import { compileAndLoadContract, originateContract, defaultEnv } from './ligo';
import { Contract, address } from './type-aliases';
import { TezosToolkit } from '@taquito/taquito';
import { TokenMetadata } from './fa2-interface';

export interface MintNftParam {
  metadata: TokenMetadata;
  owner: address;
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
  const storage = `(Pair (Pair (Pair "${admin}" False) None)
  (Pair (Pair {} 0) (Pair {} {})))`;
  return originateContract(tz, code, storage, 'nft');
}

export async function originateNftFactory(tz: TezosToolkit): Promise<Contract> {
  const code = await compileAndLoadContract(
    defaultEnv,
    'fa2_nft_factory.mligo',
    'factory_main',
    'fa2_nft_factory.tz'
  );
  return originateContract(tz, code, '{}', 'nftFactory');
}

export async function originateNftFaucet(
  tz: TezosToolkit,
  admin: address
): Promise<Contract> {
  const code = await compileAndLoadContract(
    defaultEnv,
    'fa2_multi_nft_faucet.mligo',
    'nft_faucet_main',
    'fa2_multi_nft_faucet.tz'
  );
  const storage = `(Pair (Pair {} 0) (Pair {} {}))`;
  return originateContract(tz, code, storage, 'nftFaucet');
}
