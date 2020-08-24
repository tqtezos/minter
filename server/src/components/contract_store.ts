import Configstore from 'configstore';
import path from 'path';
import { Contract, TezosToolkit } from '@taquito/taquito';

const CONFIG_NAME = 'contract-config.json';
const CONFIG_PATH = path.join(__dirname, '../../config/', CONFIG_NAME);

const configStore = new Configstore('', {}, { configPath: CONFIG_PATH });

export interface ContractStore {
  minterContract(): Promise<Contract>;
  nftContract(): Promise<Contract>;
}

export default async function buildContractStore(
  tzClient: TezosToolkit
): Promise<ContractStore> {
  return {
    minterContract() {
      const minterContractAddress = configStore.get('minter_contract');
      return tzClient.contract.at(minterContractAddress);
    },
    nftContract() {
      const nftContractAddress = configStore.get('nft_contract');
      return tzClient.contract.at(nftContractAddress);
    }
  };
}
