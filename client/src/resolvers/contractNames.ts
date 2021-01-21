import _ from 'lodash';
import { mkBetterCallDev, BetterCallDev, Address } from './betterCallDev';

interface ContractBigMapValue {
  owner: string;
  name: string;
}

export interface ContractIdentifier {
  address: string;
  name: string;
}

const contractNftOwners = async (
  betterCallDev: BetterCallDev,
  contractAddress: Address
): Promise<Address[]> => {
  const contract = await betterCallDev.contractByAddress(contractAddress);
  if (contract.contractType !== 'FA2Contract') {
    return [];
  }

  const ledgerBigMap = betterCallDev.bigMapById<string>(
    contract.bigMaps.ledger
  );
  const values = await ledgerBigMap.values();
  return values.map((v: any) => v.value);
};

const filterContractsByNftOwner = async (
  betterCallDev: BetterCallDev,
  contracts: ContractIdentifier[],
  nftOwnerAddress: Address
) => {
  const PairPromises = contracts.map(
    async (c): Promise<[string, Set<string>]> => {
      const owners = await contractNftOwners(betterCallDev, c.address);
      return [c.address, new Set(owners)];
    }
  );

  const pairs = await Promise.all(PairPromises);
  const contractToNftOwners = _.fromPairs(pairs);
  return contracts.filter(c =>
    contractToNftOwners[c.address].has(nftOwnerAddress)
  );
};

export const contractNames = async (
  contractOwnerAddress: string | null | undefined,
  nftOwnerAddress: string | null | undefined,
  factoryAddress: string,
  faucetAddress: string,
  bcdApiUrl: string,
  bcdNetwork: string
): Promise<ContractIdentifier[]> => {
  const faucetContract = { address: faucetAddress, name: 'Minter' };
  const betterCallDev = mkBetterCallDev(bcdApiUrl, bcdNetwork);
  const contract = await betterCallDev.contractByAddress(factoryAddress);

  switch (contract.contractType) {
    case 'GenericContract':
      return [];
    case 'FA2Contract':
      return [faucetContract];
    case 'FA2FactoryContract': {
      const contracts = await betterCallDev
        .bigMapById<ContractBigMapValue>(contract.contractsBigMapId)
        .values();

      const filterContracts = !_.isNil(contractOwnerAddress)
        ? contracts.filter((i: any) => i.value.owner === contractOwnerAddress)
        : contracts;

      const result = filterContracts.map((i: any) => ({
        address: i.key,
        name: i.value.name
      }));

      const allContracts = [faucetContract, ...result];

      if (_.isNil(nftOwnerAddress)) return allContracts;

      return filterContractsByNftOwner(
        betterCallDev,
        allContracts,
        nftOwnerAddress
      );
    }
  }
};
