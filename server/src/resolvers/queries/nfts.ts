import _ from 'lodash';
import { mkBetterCallDev, BetterCallDev } from './betterCallDev';
import { Context } from '../../components/context';
import { NonFungibleToken, ContractInfo } from '../../generated/graphql_schema';
import { contractNames } from './contractNames';

interface Nft {
  token_id: string;
  symbol: string;
  name: string;
  decimals: number;
  extras: string;
}

type NftBigMapValue = Nft;
type LedgerBigMapValue = string;

const nftsByContractAddress = async (
  betterCallDev: BetterCallDev,
  contractInfo: ContractInfo,
  ownerAddress: string | null | undefined
): Promise<NonFungibleToken[]> => {
  const contract = await betterCallDev.contractByAddress(contractInfo.address);

  const [ledgerId, , tokenMetadataId] = _(contract.bigmap_ids)
    .uniq()
    .sort()
    .value();

  if (contract.bigmap_ids.length === 0) {
    return [];
  }

  const tokenBigMap = betterCallDev.bigMapById<string, NftBigMapValue>(
    tokenMetadataId
  );
  const tokenItems = await tokenBigMap.values();

  const ledgerBigMap = betterCallDev.bigMapById<string, LedgerBigMapValue>(
    ledgerId
  );
  const ledgerItems = await ledgerBigMap.values();

  const ownerByTokenId = _(ledgerItems)
    .keyBy(i => i.key)
    .mapValues(v => v.value)
    .value();

  const nfts = tokenItems.map(i => ({
    ...(i.value as Nft),
    owner: ownerByTokenId[i.key]
  }));

  const transformedNfts = nfts.map(nft => ({
    contractInfo: contractInfo,
    tokenId: nft.token_id,
    symbol: nft.symbol,
    name: nft.name,
    extras: nft.extras,
    owner: nft.owner
  }));

  return _.isNil(ownerAddress)
    ? transformedNfts
    : transformedNfts.filter(i => i.owner === ownerAddress);
};

export const nfts = async (
  ownerAddress: string | null | undefined,
  contractAddress: string | null | undefined,
  ctx: Context
): Promise<NonFungibleToken[]> => {
  const betterCallDev = mkBetterCallDev(ctx.bcdApiUrl, ctx.bcdNetwork);

  const contracts = await contractNames(null, null, ctx);

  if (!_.isNil(contractAddress)) {
    const contractInfo = contracts.find(c => c.address === contractAddress);
    if (!contractInfo)
      throw Error(`Cannot find contract address: ${contractAddress}`);
    return nftsByContractAddress(betterCallDev, contractInfo, ownerAddress);
  }

  const promises = contracts.map(contractInfo => {
    return nftsByContractAddress(betterCallDev, contractInfo, ownerAddress);
  });
  const nftArrays = await Promise.all(promises);
  return _.flatten(nftArrays);
};

export const nftExists = async (
  contractAddress: string,
  tokenId: number,
  ctx: Context
): Promise<boolean> => {
  const bcd = mkBetterCallDev(ctx.bcdApiUrl, ctx.bcdNetwork);

  const contract = await bcd.contractByAddress(contractAddress);
  const [ledgerId] = _(contract.bigmap_ids).uniq().sort().value();

  const ledgerBigMap = bcd.bigMapById<string, LedgerBigMapValue>(ledgerId);
  const ledgerItems = await ledgerBigMap.values();

  return ledgerItems.find(i => i.key === tokenId.toString()) !== undefined;
};
