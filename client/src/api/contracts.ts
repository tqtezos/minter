import { TezosToolkit } from '@taquito/taquito';
import { InMemorySigner } from '@taquito/signer';

import config from '../config'
import mkNftContract from './nftContract';

const mkContracts = async () => {
  const rpc = config.rpc;
  const nftAddress = (config.contracts as any).nft as string;
  const signer = await InMemorySigner.fromSecretKey(config.admin.secret);

  const tzClient = new TezosToolkit();
  tzClient.setProvider({ rpc, signer });

  return {
    nft: () => mkNftContract(tzClient, nftAddress)
  }
};

export default mkContracts;

