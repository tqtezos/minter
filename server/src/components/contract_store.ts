import { configStore } from './context';
import { Contract, TezosToolkit } from '@taquito/taquito';

export interface ContractStore {
  nftContract(): Promise<Contract>;
}

export default async function buildContractStore(
  tzClient: TezosToolkit
): Promise<ContractStore> {
  return {
    nftContract() {
      const nftContractAddress = configStore.get('contracts.nftFaucet');
      return tzClient.contract.at(nftContractAddress);
    }
  };
}
