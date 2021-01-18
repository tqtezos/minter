import { TezosToolkit } from '@taquito/taquito';
import { BeaconWallet } from '@taquito/beacon-wallet';
import { NetworkType } from '@airgap/beacon-sdk/dist/cjs/types/beacon/NetworkType';
import { BetterCallDev } from './service/bcd';
import * as tzUtils from '../utils/tezosToolkit';

export interface Config {
  rpc: string;
  network: string;
  bcd: {
    api: string;
    gui: string;
  };
  contracts: {
    nft: string;
  };
}

export enum Status {
  Configured,
  ToolkitConnected,
  WalletConnected
}

export interface SystemConfigured {
  status: Status.Configured;
  config: Config;
  betterCallDev: BetterCallDev;
  toolkit: null;
  wallet: null;
}

export interface SystemWithToolkit {
  status: Status.ToolkitConnected;
  config: Config;
  toolkit: TezosToolkit;
  wallet: null;
}

export interface SystemWithWallet {
  status: Status.WalletConnected;
  config: Config;
  toolkit: TezosToolkit;
  wallet: BeaconWallet;
}

export type System = SystemConfigured | SystemWithToolkit | SystemWithWallet;

export function configure(config: Config): SystemConfigured {
  return {
    status: Status.Configured,
    config: config,
    betterCallDev: new BetterCallDev(config),
    toolkit: null,
    wallet: null
  };
}

export function connectToolkit(minter: SystemConfigured): SystemWithToolkit {
  const toolkit = new TezosToolkit(minter.config.rpc);
  return {
    ...minter,
    status: Status.ToolkitConnected,
    toolkit: toolkit
  };
}

function networkType(config: Config) {
  if (config.network === 'mainnet') {
    return NetworkType.MAINNET;
  }
  if (config.network === 'delphinet') {
    return NetworkType.DELPHINET;
  }
  return NetworkType.CUSTOM;
}

export async function connectWallet(
  minter: SystemWithToolkit
): Promise<SystemWithWallet> {
  const network = networkType(minter.config);

  const wallet = new BeaconWallet({
    name: 'OpenSystem dApp',
    preferredNetwork: network
  });

  await wallet.requestPermissions({
    network: { type: network, rpcUrl: minter.config.rpc }
  });

  minter.toolkit.setWalletProvider(wallet);
  tzUtils.setConfirmationPollingInterval(minter.toolkit);

  return {
    ...minter,
    status: Status.WalletConnected,
    wallet: wallet
  };
}

export const Minter = {
  configure,
  connectToolkit,
  connectWallet
};
