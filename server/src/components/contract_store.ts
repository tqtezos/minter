import Configstore from 'configstore';
import path from 'path';
import { Contract, TezosToolkit } from '@taquito/taquito';

const TZ_NETWORK = process.env.TZ_NETWORK;
const CONFIG_NAME = `minter.${TZ_NETWORK}.json`;
const CONFIG_PATH = path.join(__dirname, '../../config/', CONFIG_NAME);

const configStore = new Configstore('', {}, { configPath: CONFIG_PATH });

export interface ContractStore {
  nftContract(): Promise<Contract>;
}

export default async function buildContractStore(
  tzClient: TezosToolkit
): Promise<ContractStore> {
  return {
    nftContract() {
      const nftContractAddress = configStore.get('contracts.nft');
      return tzClient.contract.at(nftContractAddress);
    }
  };
}
