import { BigNumber } from 'bignumber.js';
import * as path from 'path';

import { TezosToolkit } from '@taquito/taquito';

import {
  compileAndLoadContract,
  originateContract,
  defaultEnv,
  LigoEnv,
  address,
  Contract
} from './ligo';

export interface BalanceOfRequest {
  owner: address;
  token_id: number;
}

export interface InspectorStorageState {
  balance: BigNumber;
  request: {
    owner: address;
    token_id: BigNumber;
  };
}

export type InspectorStorage = InspectorStorageState[] | {};

export async function originateInspector(tz: TezosToolkit): Promise<Contract> {
  const inspectorSrcDir = path.join(defaultEnv.cwd, 'fa2_clients');
  const env = new LigoEnv(defaultEnv.cwd, inspectorSrcDir, defaultEnv.outDir);

  const code = await compileAndLoadContract(
    env,
    'inspector.mligo',
    'main',
    'inspector.tz'
  );
  const storage = `(Left Unit)`;
  return originateContract(tz, code, storage, 'inspector');
}
