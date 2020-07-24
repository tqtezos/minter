import { $log } from '@tsed/logger';
import * as fs from 'fs';
import * as path from 'path';
import { TezosToolkit } from '@taquito/taquito';
import { Operation } from '@taquito/taquito/dist/types/operations/operations';
import { ContractAbstraction } from '@taquito/taquito/dist/types/contract';
import { ContractProvider } from '@taquito/taquito/dist/types/contract/interface';


export type Contract = ContractAbstraction<ContractProvider>;

function load_contract_code(filename: string): string {
  let filepath = path.join(__dirname, '../ligo/out/', filename);
  return fs.readFileSync(filepath).toString();
}

export async function originate_minter(tz: TezosToolkit, admin: string): Promise<Contract> {
  let code = load_contract_code('fa2_nft_minter.tz');
  let storage =
    `(Pair (Pair (Pair (Pair "${admin}" False) None) {}) None)`;
  return originate_contract(tz, code, storage, "minter");
}

export async function originate_nft(tz: TezosToolkit, admin: string): Promise<Contract> {
  let code = load_contract_code('fa2_multi_nft_asset.tz');
  let storage = `(Pair (Pair (Pair "${admin}" True) None) (Pair (Pair {} 0) (Pair {} {})))`;
  return originate_contract(tz, code, storage, "nft");
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function originate_contract(
  tz: TezosToolkit, code: string, storage: any, name: string): Promise<Contract> {
  try {
    const originationOp = await tz.contract.originate({
      code: code,
      init: storage
    });

    //A HACK
    await delay(5000);

    let contract = await originationOp.contract();
    $log.info(`originated contract ${name} with address ${contract.address}`);
    $log.info(`consumed gas: ${originationOp.consumedGas}`);
    return Promise.resolve(contract);
  } catch (error) {
    let jsonError = JSON.stringify(error, null, 2);
    $log.fatal(`${name} origination error ${jsonError}`);
    throw error;
  }

}