import { TezosToolkit } from '@taquito/taquito';
import { InMemorySigner } from '@taquito/signer';
import { PubSub } from 'apollo-server-express';
import buildContractStore, { ContractStore } from './contract_store';
import connect from './db';
import knex from 'knex';
import fs from 'fs';
import Configstore from 'configstore';
import path from 'path';

export type DB = knex<any, unknown[]>;

const TZ_NETWORK = getEnv('TZ_NETWORK');
const CONFIG_NAME = `minter.${TZ_NETWORK}.json`;
const CONFIG_PATH = path.join(__dirname, '../../config/', CONFIG_NAME);

export const configStore = new Configstore('', {}, { configPath: CONFIG_PATH });

export interface Context {
  db: DB;
  contractStore: ContractStore;
  pubsub: PubSub;
  tzRpcUrl: string;
  tzStatsApiUrl: string;
  tzStatsUrl: string;
  tzClient: TezosToolkit;
}

export interface SessionContext extends Context {
  session: Express.Session;
  client: TezosToolkit;
}

function getEnv(envVar: string) {
  const value = process.env[envVar];
  if (!value) throw Error(`${envVar} environment variable is not set`);
  return value;
}

function getPrivateKey(): string {
  const tzPrivateKey = configStore.get('admin.secret');
  if (tzPrivateKey) return tzPrivateKey;
  else {
    const keyPath =
      process.env.TZ_SECRET_KEY_PATH || '/run/secrets/tz_private_key';
    const tzPrivateKey = fs.readFileSync(keyPath).toString();
    return tzPrivateKey;
  }
}

async function buildTzClient(rpc: string) {
  const tzClient = new TezosToolkit();
  const tzPrivateKey = getPrivateKey();
  const signer = await InMemorySigner.fromSecretKey(tzPrivateKey);
  tzClient.setProvider({ rpc, signer });
  return tzClient;
}

export default async function createContext(): Promise<Context> {
  const db = await connect();
  const pubsub = new PubSub();
  const tzRpcUrl = getEnv('TEZOS_RPC_URL');
  const tzStatsApiUrl = `${getEnv('TZSTATS_API_URL')}/explorer`;
  const tzStatsUrl = getEnv('TZSTATS_URL');
  const tzClient = await buildTzClient(tzRpcUrl);
  const contractStore = await buildContractStore(tzClient);
  return {
    db,
    contractStore,
    pubsub,
    tzStatsApiUrl,
    tzStatsUrl,
    tzRpcUrl,
    tzClient
  };
}
