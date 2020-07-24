import { TezosToolkit } from "@taquito/taquito";
import { PubSub } from "apollo-server-express";
import knex from "knex";

export type DB = knex<any, unknown[]>;

export interface Context {
  db: DB;
  tezosRpcUrl: string;
  pubsub: PubSub;
  tzStatsApiUrl: string;
  tzStatsUrl: string;
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

export default async function createContext(db: DB): Promise<Context> {
  const pubsub = new PubSub();
  const tzStatsApiUrl = `${getEnv("TZSTATS_API_URL")}/explorer`;
  const tezosRpcUrl = getEnv("TEZOS_RPC_URL");
  const tzStatsUrl = getEnv("TZSTATS_URL");
  return { db, pubsub, tzStatsApiUrl, tzStatsUrl, tezosRpcUrl };
}
