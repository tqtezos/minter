import _ from 'lodash';

import { mkTzStats, TzStats, Address } from './tzStats';
import { Context } from '../../components/context';
import { NonFungibleToken } from '../../generated/graphql_schema';

type NftBigMapValue = Omit<NonFungibleToken, 'owner'>;
type LedgerBigMapValue = NonFungibleToken['owner'];

const nftsByContractAddress = async (
  tzStats: TzStats,
  contractAddress: string,
  ownerAddress: string | null | undefined
): Promise<NonFungibleToken[]> => {
  const contract = await tzStats.contractByAddress(contractAddress);

  const [ledgerId, , tokenMetadataId] = _(contract.bigmap_ids)
    .uniq()
    .sort()
    .value();

  const tokenBigMap = await tzStats.bigMapById<NftBigMapValue>(tokenMetadataId);
  const tokenItems = await tokenBigMap.values();

  const ledgerBigMap = await tzStats.bigMapById<LedgerBigMapValue>(ledgerId);
  const ledgerItems = await ledgerBigMap.values();

  const ownerByTokenId = _(ledgerItems)
    .keyBy(i => i.key)
    .mapValues(v => v.value)
    .value();

  const nfts = tokenItems.map(i => ({
    ...i.value,
    owner: ownerByTokenId[i.key]
  }));

  return _.isNil(ownerAddress)
    ? nfts
    : nfts.filter(i => i.owner === ownerAddress);
};

export const nfts = async (
  ownerAddress: string | null | undefined,
  contractAddress: string | null | undefined,
  ctx: Context
): Promise<NonFungibleToken[]> => {
  const tzStats = mkTzStats(ctx.tzStatsApiUrl);
  const faucetAddress = ctx.configStore.get('contracts.nftFaucet') as string;
  
  return nftsByContractAddress(tzStats, faucetAddress, ownerAddress);
};
