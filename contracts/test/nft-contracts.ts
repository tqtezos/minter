import { $log } from '@tsed/logger';
import * as path from 'path';
import { BigNumber } from 'bignumber.js'
import { compileAndLoadContract, defaultEnv, LigoEnv } from './ligo';
import { TezosToolkit, MichelsonMap } from '@taquito/taquito';
import { Operation } from '@taquito/taquito/dist/types/operations/operations';
import { ContractAbstraction } from '@taquito/taquito/dist/types/contract';
import { ContractProvider } from '@taquito/taquito/dist/types/contract/interface';


export type Contract = ContractAbstraction<ContractProvider>;

export type address = string;

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

export async function originateMinter(tz: TezosToolkit, admin: address): Promise<Contract> {
  const code = await compileAndLoadContract(defaultEnv,
    'fa2_nft_minter.mligo', 'minter_main', 'fa2_nft_minter.tz');
  const storage =
    `(Pair (Pair (Pair (Pair "${admin}" False) None) {}) None)`;
  return originateContract(tz, code, storage, "minter");
}

export async function originateNft(tz: TezosToolkit, admin: address): Promise<Contract> {
  const code = await compileAndLoadContract(defaultEnv,
    'fa2_multi_nft_asset.mligo', 'nft_asset_main', 'fa2_multi_nft_asset.tz');
  const storage = `(Pair (Pair (Pair "${admin}" True) None) (Pair (Pair {} 0) (Pair {} {})))`;
  return originateContract(tz, code, storage, "nft");
}

export interface InspectorStorage {
  balance: BigNumber,
  request: {
    owner: address,
    token_id: BigNumber
  }
}

export async function originateInspector(tz: TezosToolkit): Promise<Contract> {
  const inspectorSrcDir = path.join(defaultEnv.cwd, 'fa2_clients');
  const env = new LigoEnv(defaultEnv.cwd, inspectorSrcDir, defaultEnv.outDir);

  const code = await compileAndLoadContract(env,
    'inspector.mligo', 'main', 'inspector.tz');
  const storage = `(Left Unit)`;
  return originateContract(tz, code, storage, "inspector");
}

function delay(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms));
}

async function originateContract(
  tz: TezosToolkit, code: string, storage: any, name: string): Promise<Contract> {
  try {
    const originationOp = await tz.contract.originate({
      code,
      init: storage
    });

    //A HACK
    // await delay(5000);

    const contract = await originationOp.contract();
    $log.info(`originated contract ${name} with address ${contract.address}`);
    $log.info(`consumed gas: ${originationOp.consumedGas}`);
    return Promise.resolve(contract);
  } catch (error) {
    const jsonError = JSON.stringify(error, null, 2);
    $log.fatal(`${name} origination error ${jsonError}`);
    return Promise.reject(error);
  }

}
