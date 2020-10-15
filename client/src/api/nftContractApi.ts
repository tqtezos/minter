import { TezosToolkit } from '@taquito/taquito';

import { SettingsContracts } from '../generated/graphql_schema';
import { Address } from './contractUtil';
import { NftContract } from './nftContract';
import mkNftContract from './nftContract';
import mkNftFactoryContract from './nftFactoryContract';

export interface NftContractApi {
  faucetContractAddress: Address;
  createContract(name: string): Promise<Address>;
  contractByAddress(address: Address): Promise<NftContract>;
}

const mkContractApi = async (
  tzToolkit: TezosToolkit,
  settings: SettingsContracts
): Promise<NftContractApi> => {
  const factoryContract = await mkNftFactoryContract(
    tzToolkit,
    settings.nftFactory
  );

  return {
    faucetContractAddress: settings.nftFaucet,

    async createContract(name: string) {
      return factoryContract.createNftContract(name);
    },

    async contractByAddress(address: Address) {
      const contract = await tzToolkit.wallet.at(address);
      const ownerAddress = await tzToolkit.wallet.pkh();
      return mkNftContract(contract, ownerAddress);
    }
  };
};

export default mkContractApi;
