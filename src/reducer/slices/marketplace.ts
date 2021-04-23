import { createSlice, PayloadAction, CaseReducer } from '@reduxjs/toolkit';
import { getMarketplaceNftsQuery } from '../async/queries';
import { Nft } from '../../lib/nfts/queries';
import config from '../../config.json';
import { DataSource } from '../../lib/util/dataSource';

//// State

// Types

export type Token = Nft;

export interface Marketplace {
  address: string;
  tokens: DataSource<Token> | null;
  loaded: boolean;
}

export interface MarketplaceState {
  marketplace: Marketplace;
}

type Reducer<A> = CaseReducer<MarketplaceState, PayloadAction<A>>;

// Data

const globalMarketplaceAddress = config.contracts.marketplace.fixedPrice.tez;

export const initialState: MarketplaceState = {
  marketplace: {
    address: globalMarketplaceAddress,
    tokens: null,
    loaded: false
  }
};

//// Reducers & Slice

type PopulateMarketplace = Reducer<{ tokens: DataSource<Token> }>;

const populateMarketplaceR: PopulateMarketplace = (state, { payload }) => {
  state.marketplace.tokens = payload.tokens;
  state.marketplace.loaded = true;
};

const slice = createSlice({
  name: 'marketplace',
  initialState,
  reducers: {
    populateMarketplace: populateMarketplaceR
  },
  extraReducers: ({ addCase }) => {
    addCase(getMarketplaceNftsQuery.fulfilled, populateMarketplaceR);
  }
});

export const {
  populateMarketplace
} = slice.actions;

export default slice;
