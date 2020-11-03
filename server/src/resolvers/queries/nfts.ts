import _ from 'lodash';

import { mkTzStats, TzStats } from './tzStats';
import { mkBetterCallDev, BetterCallDev } from './betterCallDev';
import { Context } from '../../components/context';
import { NonFungibleToken, ContractInfo } from '../../generated/graphql_schema';
import { contractNames } from './contractNames';

interface BrokenNft {
  '0@nat': string;
  '1@string': string;
  '2@string': string;
  '3@nat': string;
  '4@map': any;
}
interface Nft {
  token_id: string;
  symbol: string;
  name: string;
  decimals: number;
  extras: string;
}

type NftBigMapValue = Nft | BrokenNft;
type LedgerBigMapValue = string;

const convertNft = (nftValue: NftBigMapValue) => {
  if (nftValue.hasOwnProperty('symbol')) {
    const nft = nftValue as Nft;

    return {
      tokenId: nft.token_id, // rename according to naming convention
      symbol: nft.symbol,
      name: nft.name,
      extras: nft.extras
    };
  }

  const brokenNft = nftValue as BrokenNft;

  return {
    tokenId: brokenNft['0@nat'],
    symbol: brokenNft['1@string'],
    name: brokenNft['2@string'],
    extras: brokenNft['4@map']
  };
};

const nftsByContract = async (
  tzStats: TzStats,
  contractInfo: ContractInfo,
  ownerAddress: string | null | undefined
): Promise<NonFungibleToken[]> => {
  const contract = await tzStats.contractByAddress(contractInfo.address);

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
    contractInfo,
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
  const contracts = await contractNames(null, ctx);

  if (!_.isNil(contractAddress)) {
    const contractInfo = contracts.find(c => c.address === contractAddress)
    if (!contractInfo) throw Error(`Cannot find contract address: ${contractAddress}`)
    return nftsByContract(tzStats, contractInfo, ownerAddress);
  }

  const contracts = await contractNames(null, ctx);

  const promises = contracts.map((contractInfo) =>
    nftsByContract(tzStats, contractInfo, ownerAddress)
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

  const promises = contracts.map((contractInfo) =>
    nftsByContract(tzStats, contractInfo, ownerAddress)
  );

  const nftArrays = await Promise.all(promises);
  console.log(nftArrays);
  return _.flatten(nftArrays);
};
