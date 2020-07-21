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

export function originate_minter(admin: string, tz: TezosToolkit): Promise<Contract> {
  let code = load_contract_code('fa2_nft_minter.tz');
  let storage = `(Pair (Pair (Pair (Pair "${admin}" False) None) {}) None)`;
  return originate_contract(code, storage, "minter", tz);
}

function originate_contract(
  code: string, storage: any, name: string, tz: TezosToolkit): Promise<Contract> {
  $log.debug(`code : ${code}`);
  $log.debug(`storage: ${storage}`)
  return tz.contract
    .originate({
      code: code,
      storage: storage
    })
    .then(originationOp => {
      $log.debug(`originated ${name} contract. Consumed gas: ${originationOp.consumedGas}`);
      return originationOp.contract()
    })
    .then(contract => {
      $log.debug(`${name} address: ${contract.address}`);
      return Promise.resolve(contract)
    })
    .catch(error => {
      let jsonError = JSON.stringify(error, null, 2);
      $log.error(
        `Failed to originate ${name} contract ${jsonError}`);
      return Promise.reject(jsonError);
    })
}