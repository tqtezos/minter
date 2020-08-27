import { TezosToolkit } from '@taquito/taquito';
import { InMemorySigner } from '@taquito/signer';
import { PubSub } from 'apollo-server-express';
import buildContractStore, { ContractStore } from './contract_store';
import connect from './db';
import knex from 'knex';
import fs from 'fs';

export type DB = knex<any, unknown[]>;

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

async function buildTzClient(rpc: string) {
  const tzClient = new TezosToolkit();
  const keyPath =
    process.env.TZ_SECRET_KEY_PATH || '/run/secrets/tz_private_key';
  const tzPrivateKey = fs.readFileSync(keyPath).toString();
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
