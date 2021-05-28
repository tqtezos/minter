import { createAsyncThunk } from '@reduxjs/toolkit';
import { State } from '../index';
import {
  getNftAssetContract,
  getContractNfts,
  getMarketplaceNfts,
  getWalletNftAssetContracts,
  MarketplaceNftLoadingData,
  loadMarketplaceNft,
  getNftAssetContracts
} from '../../lib/nfts/queries';
import { Nft, AssetContract } from '../../lib/nfts/decoders';
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

export const getAssetContractsQuery = createAsyncThunk<
  AssetContract[],
  string,
  Opts
>(
  'query/getNftAssetContracts',
  async (address, { getState, rejectWithValue }) => {
    const { system } = getState();
    if (system.status !== 'WalletConnected') {
      return rejectWithValue({
        kind: ErrorKind.WalletNotConnected,
        message:
          "Could not retrieve wallet's asset contracts: no wallet connected"
      });
    }
    try {
      return await getNftAssetContracts(system, address);
    } catch (e) {
      console.log(e);
      return rejectWithValue({
        kind: ErrorKind.GetNftAssetContractsFailed,
        message: "Failed to retrieve asset contracts"
      });
    }
  }
);

export const getMarketplaceNftsQuery = createAsyncThunk<
  { tokens: MarketplaceNftLoadingData[] },
  string,
  Opts
>(
  'query/getMarketplaceNfts',
  async (address, { getState, rejectWithValue }) => {
    const { system } = getState();
    try {
      const tokens = await getMarketplaceNfts(system, address);

      // Load 9 initially (1-feature + at least 2 rows)
      for (const i in tokens.slice(0, 9)) {
        tokens[i] = await loadMarketplaceNft(system, tokens[i]);
      }

      return { tokens };
    } catch (e) {
      return rejectWithValue({
        kind: ErrorKind.GetMarketplaceNftsFailed,
        message: `Failed to retrieve marketplace nfts from: ${address}`
      });
    }
  }
);

export const loadMoreMarketplaceNftsQuery = createAsyncThunk<
  { tokens: MarketplaceNftLoadingData[] },
  {},
  Opts
>(
  'query/loadMoreMarketplaceNftsQuery',
  async (_, { getState, rejectWithValue }) => {
    const { system, marketplace } = getState();
    try {
      const tokens = marketplace.marketplace.tokens ?? [];

      // Load 8 more (at least 2 rows)
      const iStart = tokens.findIndex(x => !x.loaded);
      const iEnd = iStart + 8;

      // Need to rebuild the array
      const tokensAfter = await Promise.all(
        tokens.map(async (x, i) =>
          i >= iStart && i < iEnd ? await loadMarketplaceNft(system, x) : x
        )
      );

      return { tokens: tokensAfter };
    } catch (e) {
      return rejectWithValue({
        kind: ErrorKind.GetMarketplaceNftsFailed,
        message: `Failed to load marketplace nfts`
      });
    }
  }
);
