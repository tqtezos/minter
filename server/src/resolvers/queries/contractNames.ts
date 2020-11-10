import _ from 'lodash';

import { mkTzStats, TzStats, Address } from './tzStats';
import { mkBetterCallDev, BetterCallDev } from './betterCallDev';
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
  tzStats: TzStats,
  contractAddress: Address
): Promise<Address[]> => {
  const contract = await tzStats.contractByAddress(contractAddress);
  const [ledgerId] = _(contract.bigmap_ids).uniq().sort().value();

  const ledgerBigMap = await tzStats.bigMapById<string>(ledgerId);
  const values = await ledgerBigMap.values();
  return values.map(v => v.value);
};

// TODO: Test implementation
const contractNftOwnersBcd = async (
  betterCallDev: BetterCallDev,
  contractAddress: Address
): Promise<Address[]> => {
  const contract = await betterCallDev.contractByAddress(contractAddress);
  const [ledgerId] = _(contract.bigmap_ids).uniq().sort().value();

  const ledgerBigMap = betterCallDev.bigMapById<string>(ledgerId);
  const values = await ledgerBigMap.values();
  return values.map(v => v.value);
};

const filterContractsByNftOwner = async (
  tzStats: TzStats,
  contracts: Contract[],
  nftOwnerAddress: Address
) => {
  const PairPromises = contracts.map(
    async (c): Promise<[string, Set<string>]> => {
      const owners = await contractNftOwners(tzStats, c.address);
      return [c.address, new Set(owners)];
    }
  );

  const pairs = await Promise.all(PairPromises);
  const contractToNftOwners = _.fromPairs(pairs);
  return contracts.filter(c =>
    contractToNftOwners[c.address].has(nftOwnerAddress)
  );
};

// TODO: Test implementation
const filterContractsByNftOwnerBcd = async (
  betterCallDev: BetterCallDev,
  contracts: Contract[],
  nftOwnerAddress: Address
) => {
  const PairPromises = contracts.map(
    async (c): Promise<[string, Set<string>]> => {
      const owners = await contractNftOwnersBcd(betterCallDev, c.address);
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
  const tzStats = mkTzStats(ctx.tzStatsApiUrl);

  const contract = await tzStats.contractByAddress(factoryAddress);
  const bigMapId = contract.bigmap_ids[0];

  const bigMap = await tzStats.bigMapById<ContractBigMapValue>(bigMapId);
  const contractValues = await bigMap.values();

  const filteredContractValues = !_.isNil(contractOwnerAddress)
    ? contractValues.filter(i => i.value.owner === contractOwnerAddress)
    : contractValues;

  const contracts = filteredContractValues.map(i => ({
    address: i.key,
    name: i.value.name
  }));

  const allContracts = [
    { address: faucetAddress, name: 'Minter' },
    ...contracts
  ];

  if (_.isNil(nftOwnerAddress)) return allContracts;

  return filterContractsByNftOwner(tzStats, allContracts, nftOwnerAddress);
};

export const contractNamesBcd = async (
  contractOwnerAddress: string | null | undefined,
  nftOwnerAddress: string | null | undefined,
  ctx: Context
): Promise<Contract[]> => {
  const factoryAddress = ctx.configStore.get('contracts.nftFactory') as string;
  const faucetAddress = ctx.configStore.get('contracts.nftFaucet') as string;
  const betterCallDev = mkBetterCallDev(ctx.bcdApiUrl, ctx.bcdNetwork);

  const contract = await betterCallDev.contractByAddress(factoryAddress);

  if (contract.bigmap_ids.length === 0) {
    return [{ address: faucetAddress, name: 'Minter' }];
  }
  const bigMapId = contract.bigmap_ids[0];

  const bigMap = betterCallDev.bigMapById<ContractBigMapValue>(bigMapId);
  const contracts = await bigMap.values();

  const filterContracts = !_.isNil(contractOwnerAddress)
    ? contracts.filter(i => i.value.owner === contractOwnerAddress)
    : contracts;

  const result = filterContracts.map(i => ({
    address: i.key,
    name: i.value.name
  }));

  const allContracts = [{ address: faucetAddress, name: 'Minter' }, ...result];

  // TODO: Implement filtering by NFT owner

  if (_.isNil(nftOwnerAddress)) return allContracts;

  return filterContractsByNftOwnerBcd(
    betterCallDev,
    allContracts,
    nftOwnerAddress
  );
};
