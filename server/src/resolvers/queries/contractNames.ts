import _ from 'lodash';
import { mkBetterCallDev, BetterCallDev, Address } from './betterCallDev';
import { Context } from '../../components/context';

interface ContractBigMapValue {
  owner: string;
  name: string;
}

export interface Contract {
  address: string;
  name: string;
}

const contractNftOwners = async (
  betterCallDev: BetterCallDev,
  contractAddress: Address
): Promise<Address[]> => {
  const contract = await betterCallDev.contractByAddress(contractAddress);
  const { ledger } = contract.bigmaps;

  if (ledger === undefined) {
    return [];
  }

  const ledgerBigMap = betterCallDev.bigMapById<string>(ledger);
  const values = await ledgerBigMap.values();
  return values.map(v => v.value);
};

const filterContractsByNftOwner = async (
  betterCallDev: BetterCallDev,
  contracts: Contract[],
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
  ctx: Context
): Promise<Contract[]> => {
  const factoryAddress = ctx.configStore.get('contracts.nftFactory') as string;
  const faucetAddress = ctx.configStore.get('contracts.nftFaucet') as string;
  const faucetContract = { address: faucetAddress, name: 'Minter' };
  const betterCallDev = mkBetterCallDev(ctx.bcdApiUrl, ctx.bcdNetwork);

  const contract = await betterCallDev.contractByAddress(factoryAddress);

  if (contract.bigmaps.ledger === undefined) {
    return [faucetContract];
  }

  const contracts = await betterCallDev
    .bigMapById<ContractBigMapValue>(contract.bigmaps.ledger)
    .values();

  const filterContracts = !_.isNil(contractOwnerAddress)
    ? contracts.filter(i => i.value.owner === contractOwnerAddress)
    : contracts;

  const result = filterContracts.map(i => ({
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
};
