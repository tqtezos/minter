import { Minter, SystemWithToolkit, SystemWithWallet } from '../../lib/system';
import { createSlice } from '@reduxjs/toolkit';
import config from '../../config.json';
import {
  connectWallet,
  disconnectWallet,
  reconnectWallet
} from '../async/wallet';

const initialState = Minter.connectToolkit(Minter.configure((config as any).mainnet)) as
  | SystemWithToolkit
  | SystemWithWallet;

const slice = createSlice({
  name: 'system',
  initialState,
  reducers: {
    swapConfig(state, action) {
      return {
        ...state,
        config: (config as {
          [key: string]: any,
        })[action.payload]
      }
    }
  },
  extraReducers: ({ addCase }) => {
    addCase(connectWallet.fulfilled, (_, { payload }) => payload);
    addCase(disconnectWallet.fulfilled, (_, { payload }) => payload);
    addCase(reconnectWallet.fulfilled, (_, { payload }) => payload);
  }
});

export const swapConfig = slice.actions.swapConfig;
export default slice;
