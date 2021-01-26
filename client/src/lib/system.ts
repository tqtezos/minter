import { TezosToolkit } from '@taquito/taquito';
import { BeaconWallet } from '@taquito/beacon-wallet';
import { BetterCallDev } from './service/bcd';
import * as tzUtils from './util/tezosToolkit';
import { NetworkType } from '@airgap/beacon-sdk';

export interface Config {
  rpc: string;
  network: string;
  bcd: {
    api: string;
    gui: string;
  };
  contracts: {
    nftFaucet: string;
  };
}

export enum Status {
  Configured = 'Configured',
  ToolkitConnected = 'ToolkitConnected',
  WalletConnected = 'WalletConnected'
}

export interface SystemConfigured {
  status: Status.Configured;
  config: Config;
  betterCallDev: BetterCallDev;
  toolkit: null;
  wallet: null;
  tzPublicKey: null;
}

export interface SystemWithToolkit {
  status: Status.ToolkitConnected;
  config: Config;
  betterCallDev: BetterCallDev;
  toolkit: TezosToolkit;
  wallet: null;
  tzPublicKey: null;
}

export interface SystemWithWallet {
  status: Status.WalletConnected;
  config: Config;
  betterCallDev: BetterCallDev;
  toolkit: TezosToolkit;
  wallet: BeaconWallet;
  tzPublicKey: string;
}

export type System = SystemConfigured | SystemWithToolkit | SystemWithWallet;

export function configure(config: Config): SystemConfigured {
  return {
    status: Status.Configured,
    config: config,
    betterCallDev: new BetterCallDev(config),
    toolkit: null,
    wallet: null,
    tzPublicKey: null
  };
}

export function connectToolkit(system: SystemConfigured): SystemWithToolkit {
  const toolkit = new TezosToolkit(system.config.rpc);
  return {
    ...system,
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
  system: SystemWithToolkit
): Promise<SystemWithWallet> {
  const network = networkType(system.config) as any;

  const wallet = new BeaconWallet({
    name: 'OpenSystem dApp',
    preferredNetwork: network
  });

  await wallet.requestPermissions({
    network: { type: network, rpcUrl: system.config.rpc }
  });

  system.toolkit.setWalletProvider(wallet);
  tzUtils.setConfirmationPollingInterval(system.toolkit);

  const tzPublicKey = await wallet.getPKH();

  return {
    ...system,
    status: Status.WalletConnected,
    wallet: wallet,
    tzPublicKey: tzPublicKey
  };
}

export async function disconnectWallet(
  system: SystemWithWallet
): Promise<SystemWithToolkit> {
  await system.wallet.disconnect();
  const toolkit = new TezosToolkit(system.config.rpc);
  return {
    ...system,
    status: Status.ToolkitConnected,
    toolkit: toolkit,
    wallet: null,
    tzPublicKey: null
  };
}

export const Minter = {
  configure,
  connectToolkit,
  connectWallet,
  disconnectWallet
};
