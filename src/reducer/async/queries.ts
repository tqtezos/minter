import { createAsyncThunk } from '@reduxjs/toolkit';
import { State } from '../index';
import {
  getNftAssetContract,
  AssetContract,
  getContractNfts,
  getMarketplaceNfts,
  Nft,
  getWalletNftAssetContracts
} from '../../lib/nfts/queries';
import { ErrorKind, RejectValue } from './errors';

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
  { address: string; tokens: Nft[] },
  string,
  Opts
>('query/getContractNfts', async (address, { getState, rejectWithValue }) => {
  const { system, collections } = getState();
  try {
    const tokens = await getContractNfts(system, address);
    return { address, tokens };
  } catch (e) {
    return rejectWithValue({
      kind: ErrorKind.GetContractNftsFailed,
      message: `Failed to retrieve contract nfts from: ${
        collections.collections[address]?.metadata?.name ?? address
      }`
    });
  }
});

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
      console.log(e);
      return rejectWithValue({
        kind: ErrorKind.GetWalletNftAssetContractsFailed,
        message: "Failed to retrieve wallet's asset contracts"
      });
    }
  }
);

export const getMarketplaceNftsQuery = createAsyncThunk<
  { tokens: Nft[] },
  string,
  Opts
>(
  'query/getMarketplaceNfts',
  async (address, { getState, rejectWithValue }) => {
    const { system } = getState();
    try {
      const tokens = await getMarketplaceNfts(system, address);
      return { tokens: tokens.sort((t1, t2) => t2.id - t1.id) };
    } catch (e) {
      return rejectWithValue({
        kind: ErrorKind.GetMarketplaceNftsFailed,
        message: `Failed to retrieve marketplace nfts from: ${address}`
      });
    }
  }
);
