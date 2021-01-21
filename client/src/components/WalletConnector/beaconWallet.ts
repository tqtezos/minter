import { BeaconWallet } from '@taquito/beacon-wallet';
import { NetworkType } from '@airgap/beacon-sdk/dist/cjs/types/beacon/NetworkType';
import { TezosToolkit } from '@taquito/taquito';
import * as tzUtils from '../../utils/tezosToolkit';

function networkType(network: string) {
  if (network === 'mainnet') {
    return NetworkType.MAINNET;
  }
  if (network === 'delphinet') {
    return NetworkType.DELPHINET;
  }
  return NetworkType.CUSTOM;
}

export const connect = async (
  rpc: string,
  network: string
): Promise<[TezosToolkit, BeaconWallet]> => {
  const tzToolkit = new TezosToolkit(rpc);
  const preferredNetwork = networkType(network);

  const wallet = new BeaconWallet({
    name: 'OpenMinter dApp',
    preferredNetwork
  });

  await wallet.requestPermissions({
    network: { type: preferredNetwork, rpcUrl: rpc }
  });

  tzToolkit.setWalletProvider(wallet);
  tzUtils.setConfirmationPollingInterval(tzToolkit);

  return [tzToolkit, wallet];
};
