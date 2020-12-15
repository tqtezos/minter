import { TezosToolkit } from '@taquito/taquito';
import { InMemorySigner } from '@taquito/signer';
import { PubSub } from 'apollo-server-express';
import buildContractStore, { ContractStore } from './contract_store';
import connect from './db';
import knex from 'knex';
import fs from 'fs';
import Configstore from 'configstore';
import path from 'path';
import Express from 'express-session';

export type DB = knex<any, unknown[]>;

const TZ_NETWORK = getEnv('TZ_NETWORK');
const CONFIG_NAME = `minter.${TZ_NETWORK}.json`;
const CONFIG_PATH = path.join(__dirname, '../../config/', CONFIG_NAME);

export const configStore = new Configstore('', {}, { configPath: CONFIG_PATH });

export interface Context {
  db: DB;
  contractStore: ContractStore;
  pubsub: PubSub;
  bcdApiUrl: string;
  bcdGuiUrl: string;
  bcdNetwork: string;
  tzRpcUrl: string;
  tzClient: TezosToolkit;
  configStore: Configstore;
}

function getEnv(envVar: string) {
  const value = process.env[envVar];
  if (!value) throw Error(`${envVar} environment variable is not set`);
  return value;
}

async function buildTzClient(rpc: string) {
  const tzClient = new TezosToolkit();
  tzClient.setProvider({ rpc });
  return tzClient;
}

export default async function createContext(): Promise<Context> {
  const db = await connect();
  const pubsub = new PubSub();
  const tzRpcUrl = getEnv('TEZOS_RPC_URL');
  const tzClient = await buildTzClient(tzRpcUrl);
  const bcdApiUrl = getEnv('BCD_API_URL');
  const bcdGuiUrl = getEnv('BCD_GUI_URL');
  const bcdNetwork = getEnv('BCD_NETWORK');
  const contractStore = await buildContractStore(tzClient);
  return {
    db,
    contractStore,
    pubsub,
    bcdApiUrl,
    bcdGuiUrl,
    bcdNetwork,
    tzRpcUrl,
    tzClient,
    configStore
  };
}
