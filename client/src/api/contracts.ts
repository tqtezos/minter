import { TezosToolkit } from '@taquito/taquito';
import { InMemorySigner } from '@taquito/signer';

import mkNftContract from './nftContract';
import { Settings } from '../generated/graphql_schema';

const mkContracts = async (settings: Settings) => {
  const rpc = settings.rpc;
  const nftAddress = settings.contracts.nftFaucet;
  const signer = await InMemorySigner.fromSecretKey(settings.admin.secret);

  const tzClient = new TezosToolkit();
  tzClient.setProvider({ rpc, signer });

  return {
    nft: () => mkNftContract(tzClient, nftAddress)
  }
};

export default mkContracts;

