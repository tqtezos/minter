import {
  TezosToolkit,
  MichelCodecPacker,
  Context,
  ContractAbstraction,
  ContractProvider
} from '@taquito/taquito';
import { BeaconWallet } from '@taquito/beacon-wallet';
import { MetadataProvider, DEFAULT_HANDLERS } from '@taquito/tzip16';
import { Tzip12Module } from '@taquito/tzip12';
import CustomIpfsHttpHandler from './util/taquito-custom-ipfs-http-handler';
import { BetterCallDev } from './service/bcd';
import * as tzUtils from './util/tezosToolkit';
import { DAppClientOptions, NetworkType } from '@airgap/beacon-sdk';
import { TzKt } from './service/tzkt';
import { isIpfsUri } from './util/ipfs';

export interface Config {
  rpc: string;
  network: string;
  bcd: {
    api: string;
    gui: string;
  };
  tzkt: {
    api: string;
  };
  contracts: {
    nftFaucet: string;
    marketplace: {
      fixedPrice: {
        tez: string;
      };
    };
  };
  ipfsApi: string;
  ipfsGateway: string;
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
  tzkt: TzKt;
  toolkit: null;
  wallet: null;
  walletReconnectAttempted: boolean;
  tzPublicKey: null;
}

type ResolveMetadata = (
  uri: string,
  address: string
) => ReturnType<MetadataProvider['provideMetadata']>;

export interface SystemWithToolkit {
  status: Status.ToolkitConnected;
  config: Config;
  betterCallDev: BetterCallDev;
  tzkt: TzKt;
  toolkit: TezosToolkit;
  resolveMetadata: ResolveMetadata;
  wallet: null;
  walletReconnectAttempted: boolean;
  tzPublicKey: null;
}

export interface SystemWithWallet {
  status: Status.WalletConnected;
  config: Config;
  betterCallDev: BetterCallDev;
  tzkt: TzKt;
  toolkit: TezosToolkit;
  resolveMetadata: ResolveMetadata;
  wallet: BeaconWallet;
  walletReconnectAttempted: boolean;
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
    tzkt: new TzKt(compatibilityConfig),
    toolkit: null,
    wallet: null,
    walletReconnectAttempted: false,
    tzPublicKey: null
  };
}

function createMetadataResolver(
  system: SystemConfigured,
  toolkit: TezosToolkit,
  contractAddress: string
): ResolveMetadata {
  const ipfsUrl = system.config.ipfsGateway;
  const ipfsGateway = ipfsUrl.replace(/^https?:\/\//, '');
  const gatewayProtocol = ipfsUrl.startsWith('https') ? 'https' : 'http';

  const ipfsHandler = new CustomIpfsHttpHandler(ipfsGateway, gatewayProtocol);
  DEFAULT_HANDLERS.set('ipfs', ipfsHandler);
  const provider = new MetadataProvider(DEFAULT_HANDLERS);
  const context = new Context(toolkit.rpc);

  const defaultContract = toolkit.contract.at(contractAddress);
  type Contract = ContractAbstraction<ContractProvider>;
  const contractCache: Record<string, Contract> = {};

  return async (uri, address) => {
    if (isIpfsUri(uri)) {
      const contract = await defaultContract;
      return provider.provideMetadata(contract, uri, context);
    }
    if (!contractCache[address]) {
      contractCache[address] = await toolkit.contract.at(address);
    }
    return provider.provideMetadata(contractCache[address], uri, context);
  };
}

export function connectToolkit(system: SystemConfigured): SystemWithToolkit {
  const toolkit = new TezosToolkit(system.config.rpc);
  toolkit.addExtension(new Tzip12Module());
  toolkit.setPackerProvider(new MichelCodecPacker());
  const faucetAddress = system.config.contracts.nftFaucet;
  return {
    ...system,
    status: Status.ToolkitConnected,
    toolkit: toolkit,
    resolveMetadata: createMetadataResolver(system, toolkit, faucetAddress),
    walletReconnectAttempted: false
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
  if (config.network === 'florencenet') {
    return NetworkType.FLORENCENET;
  }
  return NetworkType.CUSTOM;
}

let wallet: BeaconWallet | null = null;

function getWallet(
  system: SystemWithToolkit,
  eventHandlers?: DAppClientOptions['eventHandlers']
): BeaconWallet {
  if (wallet === null) {
    wallet = new BeaconWallet({
      name: 'OpenSystem dApp',
      preferredNetwork: networkType(system.config),
      eventHandlers
    });
  }
  return wallet;
}

async function initWallet(
  system: SystemWithToolkit,
  forceConnect: boolean,
  eventHandlers?: DAppClientOptions['eventHandlers']
): Promise<boolean> {
  const network = networkType(system.config);
  const wallet = getWallet(system, eventHandlers);

  const activeAccount = await wallet.client.getActiveAccount();

  if (!activeAccount) {
    if (forceConnect) {
      try {
        await wallet.requestPermissions({
          network: {
            type:
              system.config.network === 'edo2net'
                ? (system.config.network as NetworkType)
                : network,
            rpcUrl: system.config.rpc
          }
        });
      } catch (error) {
        // requestPermissions failed - reset wallet selection
        wallet.clearActiveAccount();
        throw error;
      }
    } else {
      return false;
    }
  }

  return true;
}

async function createSystemWithWallet(
  system: SystemWithToolkit
): Promise<SystemWithWallet> {
  const wallet = getWallet(system);

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

export async function reconnectWallet(
  system: SystemWithToolkit,
  eventHandlers?: DAppClientOptions['eventHandlers']
): Promise<SystemWithWallet | SystemWithToolkit> {
  const connected = await initWallet(system, false, eventHandlers);
  if (connected) {
    const systemWithWallet = await createSystemWithWallet(system);
    return { ...systemWithWallet, walletReconnectAttempted: true };
  } else {
    return { ...system, walletReconnectAttempted: true };
  }
}

export async function connectWallet(
  system: SystemWithToolkit,
  eventHandlers?: DAppClientOptions['eventHandlers']
): Promise<SystemWithWallet> {
  await initWallet(system, true, eventHandlers);
  return await createSystemWithWallet(system);
}

export async function disconnectWallet(
  system: SystemWithWallet
): Promise<SystemWithToolkit> {
  await system.wallet.disconnect();
  const toolkit = new TezosToolkit(system.config.rpc);
  toolkit.setPackerProvider(new MichelCodecPacker());
  toolkit.addExtension(new Tzip12Module());
  wallet = null;
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
  reconnectWallet,
  connectToolkit,
  connectWallet,
  disconnectWallet
};
