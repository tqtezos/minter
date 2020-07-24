import { $log } from '@tsed/logger';
import * as fs from 'fs';
import * as path from 'path';
import { TezosToolkit } from '@taquito/taquito';
import { Operation } from '@taquito/taquito/dist/types/operations/operations';
import { ContractAbstraction } from '@taquito/taquito/dist/types/contract';
import { ContractProvider } from '@taquito/taquito/dist/types/contract/interface';


type Contract = ContractAbstraction<ContractProvider>;

function load_contract_code(filename: string): string {
  let filepath = path.join(__dirname, '../ligo/out/', filename);
  return fs.readFileSync(filepath).toString();
}

export async function originate_minter(tz: TezosToolkit, admin: string): Promise<Contract> {
  let code = load_contract_code('fa2_nft_minter.tz');
  let storage = `(Pair (Pair (Pair (Pair "${admin}" False) None) {}) None)`;
  return originate_contract(tz, code, storage, "minter");
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
    $log.debug(`get originating op. address ${originationOp.contractAddress}`);

    //A HACK
    await delay(5000);

    let contract = await originationOp.contract();
    $log.debug(`originated contract ${name} with address ${contract.address}`);
    $log.debug(`consumed gas: ${originationOp.consumedGas}`);
    return Promise.resolve(contract);
  } catch (error) {
    let jsonError = JSON.stringify(error, null, 2);
    $log.fatal(`${name} origination error ${jsonError}`);
    throw error;
  }

}