import { createAsyncThunk } from '@reduxjs/toolkit';
import { State } from '../index';
import {
  getNftAssetContract,
  AssetContract,
  getContractNfts,
  Nft,
  getWalletNftAssetContracts
} from '../../lib/nfts/queries';

type Opts = { state: State };

export const getNftAssetContractQuery = createAsyncThunk<
  AssetContract,
  string,
  Opts
>('query/getNftAssetContract', async (address, api) => {
  const { system } = api.getState();
  try {
    return await getNftAssetContract(system, address);
  } catch (e) {
    return api.rejectWithValue({ error: '' });
  }
});

export const getContractNftsQuery = createAsyncThunk<
  { address: string; tokens: Nft[] },
  string,
  Opts
>('query/getContractNfts', async (address, api) => {
  const { system } = api.getState();
  try {
    const tokens = await getContractNfts(system, address);
    return { address, tokens };
  } catch (e) {
    return api.rejectWithValue({ error: '' });
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
      return rejectWithValue({ error: '' });
    }
    try {
      return await getWalletNftAssetContracts(system);
    } catch (e) {
      return rejectWithValue({ error: '' });
    }
  }
);
