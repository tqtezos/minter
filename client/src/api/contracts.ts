import { TezosToolkit, Signer } from '@taquito/taquito';
import { InMemorySigner } from '@taquito/signer';

import mkNftContract from './nftContract';
import { Settings } from '../generated/graphql_schema';

const mkContracts = async (settings: Settings) => {
  const rpc = settings.rpc;
  const nftAddress = settings.contracts.nftFaucet;
  const signer = await InMemorySigner.fromSecretKey(settings.admin.secret);
  const tzClient = await createToolkit(rpc, signer);

  return {
    nft: () => mkNftContract(tzClient, nftAddress)
  };
};

const createToolkit = async (rpc: string, signer: Signer) => {
  const tzClient = new TezosToolkit();
  tzClient.setProvider({ rpc, signer });

  const constants = await tzClient.rpc.getConstants();
  const confirmationPollingIntervalSecond: number =
    Number(constants.time_between_blocks[0]) / 5;
  tzClient.setProvider({ config: { confirmationPollingIntervalSecond } });

  return tzClient;
};

export default mkContracts;
