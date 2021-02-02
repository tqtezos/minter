import { createSlice, PayloadAction, CaseReducer } from '@reduxjs/toolkit';
import {
  getContractNftsQuery,
  getNftAssetContractQuery,
  getWalletAssetContractsQuery
} from '../async/queries';
import { Nft, AssetContract } from '../../lib/nfts/queries';
import config from '../../config.json';

//// State

// Types

export interface Collection extends AssetContract {
  tokens: Nft[] | null;
}

export interface CollectionsState {
  selectedCollection: string | null;
  globalCollection: string;
  collections: Record<string, Collection>;
}

type Reducer<A> = CaseReducer<CollectionsState, PayloadAction<A>>;

// Data

const globalCollectionAddress = config.contracts.nftFaucet;

export const initialState: CollectionsState = {
  selectedCollection: null,
  globalCollection: globalCollectionAddress,
  collections: {
    [globalCollectionAddress]: {
      address: globalCollectionAddress,
      metadata: {
        name: 'Minter'
      },
      tokens: null
    }
  }
};

//// Reducers & Slice

type PopulateCollection = Reducer<{ address: string; tokens: Nft[] }>;

const populateCollection: PopulateCollection = (state, { payload }) => {
  if (state.collections[payload.address]) {
    state.collections[payload.address].tokens = payload.tokens;
  }
};

const updateCollections: Reducer<AssetContract[]> = (state, action) => {
  for (let coll of action.payload) {
    if (!state.collections[coll.address]) {
      state.collections[coll.address] = { ...coll, tokens: null };
    }
  }
};

const updateCollection: Reducer<AssetContract> = (state, { payload }) => {
  if (!state.collections[payload.address]) {
    state.collections[payload.address] = { ...payload, tokens: null };
  }
};

const selectCollection: Reducer<string> = (state, action) => {
  state.selectedCollection = action.payload;
};

const slice = createSlice({
  name: 'collections',
  initialState,
  reducers: {
    updateCollections,
    updateCollection,
    selectCollection,
    populateCollection
  },
  extraReducers: ({ addCase }) => {
    addCase(getContractNftsQuery.fulfilled, populateCollection);
    addCase(getNftAssetContractQuery.fulfilled, updateCollection);
    addCase(getWalletAssetContractsQuery.fulfilled, updateCollections);
  }
});

export default slice;
