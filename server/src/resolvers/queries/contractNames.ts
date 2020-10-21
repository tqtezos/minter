import _ from 'lodash';

import { mkTzStats, Address } from './tzStats';
import { Context } from '../../components/context';

interface ContractBigMapValue {
  owner: Address;
  name: string;
}

export interface Contract {
  address: Address;
  name: string;
}

export const contractNames = async (
  ownerAddress: string | null | undefined,
  ctx: Context
): Promise<Contract[]> => {
  const factoryAddress = ctx.configStore.get('contracts.nftFactory') as string;
  const faucetAddress = ctx.configStore.get('contracts.nftFaucet') as string;
  const tzStats = mkTzStats(ctx.tzStatsApiUrl);

  const contract = await tzStats.contractByAddress(factoryAddress);
  const bigMapId = contract.bigmap_ids[0];

  const bigMap = await tzStats.bigMapById<ContractBigMapValue>(bigMapId);
  const contracts = await bigMap.values();

  const filterContracts = !_.isNil(ownerAddress)
    ? contracts.filter(i => i.value.owner === ownerAddress)
    : contracts;

  const result = filterContracts.map(i => ({
    address: i.key,
    name: i.value.name
  }));

  return [{ address: faucetAddress, name: 'Minter' }, ...result];
};
