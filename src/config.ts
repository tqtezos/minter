import configFile from './config.json';
import { Config } from './lib/system';

const {
  REACT_APP_CONFIG_RPC = '',
  REACT_APP_CONFIG_TZKT_API = '',
  REACT_APP_CONFIG_NETWORK = '',
  REACT_APP_CONFIG_BCD_API = '',
  REACT_APP_CONFIG_BCD_GUI = '',
  REACT_APP_CONFIG_CONTRACTS_NFT_FAUCET = '',
  REACT_APP_CONFIG_CONTRACTS_MARKETPLACE_FIXED_PRICE_TEZ = '',
  REACT_APP_CONFIG_IPFS_API = '',
  REACT_APP_CONFIG_IPFS_GATEWAY = ''
} = process.env;

const defaultConfig: Config = {
  rpc: 'https://rpctest.tzbeta.net',
  tzkt: {
    api: 'https://staging.api.edo2net.tzkt.io'
  },
  network: 'edonet',
  bcd: {
    api: 'https://api.better-call.dev',
    gui: 'https://better-call.dev'
  },
  contracts: {
    nftFaucet: '',
    marketplace: {
      fixedPrice: {
        tez: ''
      }
    }
  },
  ipfsApi: 'http://localhost:3300',
  ipfsGateway: 'https://mypinata.cloud'
};

const config: Config = {
  rpc: REACT_APP_CONFIG_RPC || configFile.rpc || defaultConfig.rpc,
  tzkt: {
    api:
      REACT_APP_CONFIG_TZKT_API || configFile.tzkt.api || defaultConfig.tzkt.api
  },
  network:
    REACT_APP_CONFIG_NETWORK || configFile.network || defaultConfig.network,
  bcd: {
    api:
      REACT_APP_CONFIG_BCD_API || configFile.bcd.api || defaultConfig.bcd.api,
    gui: REACT_APP_CONFIG_BCD_GUI || configFile.bcd.gui || defaultConfig.bcd.gui
  },
  contracts: {
    nftFaucet:
      REACT_APP_CONFIG_CONTRACTS_NFT_FAUCET ||
      configFile.contracts.nftFaucet ||
      defaultConfig.contracts.nftFaucet,
    marketplace: {
      fixedPrice: {
        tez:
          REACT_APP_CONFIG_CONTRACTS_MARKETPLACE_FIXED_PRICE_TEZ ||
          configFile.contracts.marketplace.fixedPrice.tez ||
          defaultConfig.contracts.marketplace.fixedPrice.tez
      }
    }
  },
  ipfsApi:
    REACT_APP_CONFIG_IPFS_API || configFile.ipfsApi || defaultConfig.ipfsApi,
  ipfsGateway:
    REACT_APP_CONFIG_IPFS_GATEWAY ||
    configFile.ipfsGateway ||
    defaultConfig.ipfsGateway
};

export default config;
