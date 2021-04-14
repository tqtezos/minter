import { createSlice, PayloadAction, CaseReducer } from '@reduxjs/toolkit';
import {
  getContractNftsQuery,
  getNftAssetContractQuery,
  getTransactionsByHash,
  getWalletAssetContractsQuery
} from '../async/queries';
import { Nft, AssetContract } from '../../lib/nfts/queries';
import config from '../../config.json';

//// State

// Types

export type Token = Nft;

export interface Collection extends AssetContract {
  tokens: Token[] | null;
  loaded: boolean;
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
      tokens: null,
      loaded: false
    }
  }
};

//// Reducers & Slice

type PopulateCollection = Reducer<{ address: string; tokens: Token[] }>;

const populateCollectionR: PopulateCollection = (state, { payload }) => {
  if (state.collections[payload.address]) {
    state.collections[payload.address].tokens = payload.tokens;
    state.collections[payload.address].loaded = true;
  }
};

const updateCollectionsR: Reducer<AssetContract[]> = (state, action) => {
  for (let coll of action.payload) {
    if (!state.collections[coll.address]) {
      state.collections[coll.address] = { ...coll, tokens: null, loaded: false };
    }
  }
};

const updateCollectionR: Reducer<AssetContract> = (state, { payload }) => {
    state.collections[payload.address] = {...state.collections[payload.address], tokens: null, loaded: false, ...payload };
    console.log(state.collections[payload.address]);
};

const selectCollectionR: Reducer<string> = (state, action) => {
  state.selectedCollection = action.payload;
};

const slice = createSlice({
  name: 'collections',
  initialState,
  reducers: {
    updateCollections: updateCollectionsR,
    updateCollection: updateCollectionR,
    selectCollection: selectCollectionR,
    populateCollection: populateCollectionR
  },
  extraReducers: ({ addCase }) => {
    addCase(getContractNftsQuery.fulfilled, populateCollectionR);
    addCase(getNftAssetContractQuery.fulfilled, updateCollectionR);
    addCase(getWalletAssetContractsQuery.fulfilled, updateCollectionsR);
    addCase(getTransactionsByHash.fulfilled, updateCollectionR);
  }
});

export const {
  updateCollections,
  updateCollection,
  selectCollection,
  populateCollection
} = slice.actions;

export default slice;
