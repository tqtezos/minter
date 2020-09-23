import { TezosToolkit } from '@taquito/taquito';
import { InMemorySigner } from '@taquito/signer';

import config from '../config'
import mkNftContract from './nftContract';
import { Settings } from '../generated/graphql_schema';

const mkContracts = async (settings: Settings) => {
  const rpc = settings.rpc;
  const nftAddress =settings.contracts.nft;
  const signer = await InMemorySigner.fromSecretKey(config.admin.secret);

  const tzClient = new TezosToolkit();
  tzClient.setProvider({ rpc, signer });

  return {
    nft: () => mkNftContract(tzClient, nftAddress)
  }
};

export default mkContracts;

