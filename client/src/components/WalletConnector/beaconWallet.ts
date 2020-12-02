import { BeaconWallet } from '@taquito/beacon-wallet';
import { NetworkType } from '@airgap/beacon-sdk/dist/cjs/types/beacon/NetworkType';
import { TezosToolkit } from '@taquito/taquito';
import * as tzUtils from '../../utils/tezosToolkit';

export const connect = async (rpc: string) => {
  // const available = false;
  //
  // if (!available)
  //   throw new Error('Beacon Wallet is not installed!');

  const tzToolkit = new TezosToolkit(rpc);
  // tzToolkit.setProvider({ rpc });

  const wallet = new BeaconWallet({
    name: 'OpenMinter dApp'
  });

  await wallet.requestPermissions({
    network: { type: NetworkType.CUSTOM, rpcUrl: rpc }
  });

  tzToolkit.setWalletProvider(wallet);
  tzUtils.setConfirmationPollingInterval(tzToolkit);

  return tzToolkit;
};
