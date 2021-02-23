import { TezosToolkit, Context } from '@taquito/taquito';
import { BeaconWallet } from '@taquito/beacon-wallet';
import { MetadataProvider, DEFAULT_HANDLERS } from '@taquito/tzip16';
import CustomIpfsHttpHandler from './util/taquito-custom-ipfs-http-handler';
import { BetterCallDev } from './service/bcd';
import * as tzUtils from './util/tezosToolkit';
import { DAppClientOptions, NetworkType } from '@airgap/beacon-sdk';

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

type ResolveMetadata = (
  uri: string
) => ReturnType<MetadataProvider['provideMetadata']>;

export interface SystemWithToolkit {
  status: Status.ToolkitConnected;
  config: Config;
  betterCallDev: BetterCallDev;
  toolkit: TezosToolkit;
  resolveMetadata: ResolveMetadata;
  wallet: null;
  tzPublicKey: null;
}

export interface SystemWithWallet {
  status: Status.WalletConnected;
  config: Config;
  betterCallDev: BetterCallDev;
  toolkit: TezosToolkit;
  resolveMetadata: ResolveMetadata;
  wallet: BeaconWallet;
  tzPublicKey: string;
}

export type System = SystemConfigured | SystemWithToolkit | SystemWithWallet;

export function configure(config: Config): SystemConfigured {
  // Upgrade `edonet` reference in config to `edo2net`. This is done for the
  // sake of compatibility since the meaning of "edonet" is ambiguous: in some
  // parts of the ecosystem it refers to latest version of edonet, which is also
  // referred to as "edo2net".
  const compatibilityConfig = {
    ...config,
    network: config.network === 'edonet' ? 'edo2net' : config.network
  };
  return {
    status: Status.Configured,
    config: compatibilityConfig,
    betterCallDev: new BetterCallDev(compatibilityConfig),
    toolkit: null,
    wallet: null,
    tzPublicKey: null
  };
}

function createMetadataResolver(
  system: SystemConfigured,
  toolkit: TezosToolkit,
  contractAddress: string
): ResolveMetadata {
  const ipfsGateway =
    system.config.network === 'sandboxnet'
      ? 'localhost:8080'
      : 'gateway.ipfs.io';
  const gatewayProtocol =
    system.config.network === 'sandboxnet' ? 'http' : 'https';
  const ipfsHandler = new CustomIpfsHttpHandler(ipfsGateway, gatewayProtocol);
  DEFAULT_HANDLERS.set('ipfs', ipfsHandler);
  const provider = new MetadataProvider(DEFAULT_HANDLERS);
  const context = new Context(toolkit.rpc);
  // This is a performance optimization: We're only resolving off-chain
  // metadata, however the storage handler requires a ContractAbstraction
  // instance present - if we fetch a contract on each invokation, the time
  // to resolution can take several hundred milliseconds.
  //
  // TODO: Is it possible to only fetch contracts at the storage resolver level
  // and make an "off-chain" metadata resolver that excludes the need for a
  // ContractAbstraction instance?
  const defaultContract = toolkit.contract.at(contractAddress);
  return async uri => {
    const contract = await defaultContract;
    return provider.provideMetadata(contract, uri, context);
  };
}

export function connectToolkit(system: SystemConfigured): SystemWithToolkit {
  const toolkit = new TezosToolkit(system.config.rpc);
  const faucetAddress = system.config.contracts.nftFaucet;
  return {
    ...system,
    status: Status.ToolkitConnected,
    toolkit: toolkit,
    resolveMetadata: createMetadataResolver(system, toolkit, faucetAddress)
  };
}

function networkType(config: Config) {
  if (config.network === 'mainnet') {
    return NetworkType.MAINNET;
  }
  if (config.network === 'delphinet') {
    return NetworkType.DELPHINET;
  }
  // Edonet support is split between two network types, edonet and edo2net. For
  // now, .CUSTOM must be used when referring to edo2net.
  if (config.network === 'edonet') {
    return NetworkType.EDONET;
  }
  if (config.network === 'edo2net') {
    return NetworkType.CUSTOM;
  }
  return NetworkType.CUSTOM;
}

let wallet: BeaconWallet | null = null;

export async function connectWallet(
  system: SystemWithToolkit,
  eventHandlers?: DAppClientOptions['eventHandlers']
): Promise<SystemWithWallet> {
  const network = networkType(system.config);

  if (wallet === null) {
    wallet = new BeaconWallet({
      name: 'OpenSystem dApp',
      preferredNetwork: network,
      eventHandlers
    });
  }

  await wallet.requestPermissions({
    network: {
      type:
        system.config.network === 'edo2net'
          ? (system.config.network as NetworkType)
          : network,
      rpcUrl: system.config.rpc
    }
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
