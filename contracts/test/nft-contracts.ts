import { $log } from '@tsed/logger';
import { compile_and_load_contract } from './ligo';
import { TezosToolkit } from '@taquito/taquito';
import { Operation } from '@taquito/taquito/dist/types/operations/operations';
import { ContractAbstraction } from '@taquito/taquito/dist/types/contract';
import { ContractProvider } from '@taquito/taquito/dist/types/contract/interface';


export type Contract = ContractAbstraction<ContractProvider>;


export async function originate_minter(tz: TezosToolkit, admin: string): Promise<Contract> {
  const code = await compile_and_load_contract(
    'fa2_nft_minter.mligo', 'minter_main', 'fa2_nft_minter.tz');
  const storage =
    `(Pair (Pair (Pair (Pair "${admin}" False) None) {}) None)`;
  return originate_contract(tz, code, storage, "minter");
}

export async function originate_nft(tz: TezosToolkit, admin: string): Promise<Contract> {
  const code = await compile_and_load_contract(
    'fa2_multi_nft_asset.mligo', 'nft_asset_main', 'fa2_multi_nft_asset.tz');
  const storage = `(Pair (Pair (Pair "${admin}" True) None) (Pair (Pair {} 0) (Pair {} {})))`;
  return originate_contract(tz, code, storage, "nft");
}

function delay(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms));
}

async function originate_contract(
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
