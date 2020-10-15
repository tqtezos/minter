import Configstore from 'configstore';
import { TzStats, Address } from './tzStats';
import { Context } from '../../components/context';

interface ContractBigMapValue {
  owner: Address;
  name: string;
}

export interface Contract {
  address: Address;
  name: string;
}

export const contractNamesByOwner = async (
  ownerAddress: string | null | undefined,
  ctx: Context
): Promise<Contract[]> => {
  const factoryAddress = ctx.configStore.get('contracts.nftFactory') as string;
  const faucetAddress = ctx.configStore.get('contracts.nftFaucet') as string;
  const tzStats = TzStats(ctx.tzStatsApiUrl);

  const contract = await tzStats.contractByAddress(factoryAddress);
  const bigMapId = contract.bigmap_ids[0];

  const bigMap = await tzStats.bigMapById<ContractBigMapValue>(bigMapId);
  const contacts = await bigMap.values();

  const filteredContracts = contacts
    .filter(i => i.value.owner === ownerAddress)
    .map(i => ({ address: i.key, name: i.value.name }));

  return [{ address: faucetAddress, name: 'Minter' }, ...filteredContracts];
};
