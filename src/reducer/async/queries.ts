import { createAsyncThunk } from '@reduxjs/toolkit';
import { State } from '../index';
import {
  getNftAssetContract,
  AssetContract,
  getContractNfts,
  Nft,
  getWalletNftAssetContracts
} from '../../lib/nfts/queries';
import { ErrorKind, RejectValue } from './errors';
import { Collection } from '../slices/collections';

type Opts = { state: State; rejectValue: RejectValue };

export const getNftAssetContractQuery = createAsyncThunk<
  AssetContract,
  string,
  Opts
>('query/getNftAssetContract', async (address, api) => {
  const { getState, rejectWithValue } = api;
  const { system } = getState();
  try {
    return await getNftAssetContract(system, address);
  } catch (e) {
    return rejectWithValue({
      kind: ErrorKind.GetNftAssetContractFailed,
      message: `Failed to retrieve asset contract: ${address}`
    });
  }
});

export const getContractNftsQuery = createAsyncThunk<
  { collection: Collection | AssetContract; tokens: Nft[] },
  { collection: Collection | AssetContract; purge: boolean },
  Opts
>(
  'query/getContractNfts',
  async ({ collection, purge }, { getState, rejectWithValue }) => {
    const { system } = getState();
    try {
      const tokens = await getContractNfts(system, collection, purge);
      return { collection, tokens };
    } catch (e) {
      return rejectWithValue({
        kind: ErrorKind.GetContractNftsFailed,
        message: `Failed to retrieve contract nfts from: ${collection}`
      });
    }
  }
);

export const getWalletAssetContractsQuery = createAsyncThunk<
  AssetContract[],
  undefined,
  Opts
>(
  'query/getWalletNftAssetContracts',
  async (_, { getState, rejectWithValue }) => {
    const { system } = getState();
    if (system.status !== 'WalletConnected') {
      return rejectWithValue({
        kind: ErrorKind.WalletNotConnected,
        message:
          "Could not retrieve wallet's asset contracts: no wallet connected"
      });
    }
    try {
      return await getWalletNftAssetContracts(system);
    } catch (e) {
      return rejectWithValue({
        kind: ErrorKind.GetWalletNftAssetContractsFailed,
        message: "Failed to retrieve wallet's asset contracts"
      });
    }
  }
);
