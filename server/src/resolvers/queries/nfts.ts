import _ from 'lodash';

import { mkTzStats, TzStats } from './tzStats';
import { mkBetterCallDev, BetterCallDev } from './betterCallDev';
import { Context } from '../../components/context';
import { NonFungibleToken } from '../../generated/graphql_schema';
import { contractNames } from './contractNames';

type Nft = Omit<NonFungibleToken, 'owner'>;

interface BrokenNft {
  '0@nat': string;
  '1@string': string;
  '2@string': string;
  '3@nat': string;
  '4@map': any;
}

type NftBigMapValue = Nft | BrokenNft;
type LedgerBigMapValue = NonFungibleToken['owner'];

const convertNft = (nft: NftBigMapValue): Nft => {
  if (nft.hasOwnProperty('symbol')) return nft as Nft;

  const brokenNft = nft as BrokenNft;
  return {
    token_id: brokenNft['0@nat'],
    symbol: brokenNft['1@string'],
    name: brokenNft['2@string'],
    decimals: 0,
    extras: brokenNft['4@map']
  };
};

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
    ...convertNft(i.value),
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

  if (!_.isNil(contractAddress))
    return nftsByContractAddress(tzStats, contractAddress || '', ownerAddress);

  const contracts = await contractNames(null, ctx);

  const promises = contracts.map(({ address }) =>
    nftsByContractAddress(tzStats, address, ownerAddress)
  );

  const nftArrays = await Promise.all(promises);
  return _.flatten(nftArrays);
};

const nftsByContractAddressBcd = async (
  betterCallDev: BetterCallDev,
  contractAddress: string,
  ownerAddress: string | null | undefined
): Promise<NonFungibleToken[]> => {
  const contract = await betterCallDev.contractByAddress(contractAddress);

  const [ledgerId, , tokenMetadataId] = _(contract.bigmap_ids)
    .uniq()
    .sort()
    .value();

  const tokenBigMap = betterCallDev.bigMapById<NftBigMapValue>(tokenMetadataId);
  const tokenItems = await tokenBigMap.values();

  const ledgerBigMap = betterCallDev.bigMapById<LedgerBigMapValue>(ledgerId);
  const ledgerItems = await ledgerBigMap.values();

  const ownerByTokenId = _(ledgerItems)
    .keyBy(i => i.key)
    .mapValues(v => v.value)
    .value();

  console.log(tokenItems);

  const nfts = tokenItems.map(i => ({
    ...(i.value as Nft),
    owner: ownerByTokenId[i.key]
  }));

  return _.isNil(ownerAddress)
    ? nfts
    : nfts.filter(i => i.owner === ownerAddress);
};

export const nftsBcd = async (
  ownerAddress: string | null | undefined,
  contractAddress: string | null | undefined,
  ctx: Context
): Promise<NonFungibleToken[]> => {
  const betterCallDev = mkBetterCallDev('http://bcdapi:14000', 'sandboxnet');

  if (!_.isNil(contractAddress))
    return nftsByContractAddressBcd(
      betterCallDev,
      contractAddress || '',
      ownerAddress
    );

  const contracts = await contractNames(null, ctx);

  const promises = contracts.map(({ address }) =>
    nftsByContractAddressBcd(betterCallDev, address, ownerAddress)
  );

  const nftArrays = await Promise.all(promises);
  console.log(nftArrays);
  return _.flatten(nftArrays);
};
