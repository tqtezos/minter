import { Minter, SystemWithToolkit, SystemWithWallet } from '../../lib/system';
import { createSlice } from '@reduxjs/toolkit';
import config from '../../config.json';
import { connectWallet, disconnectWallet, reconnectWallet } from '../async/wallet';
const cobj = (config as {[key: string]: any})[`${process.env.REACT_APP_NETWORK}`];

const initialState = Minter.connectToolkit(Minter.configure(cobj)) as
  | SystemWithToolkit
  | SystemWithWallet;

const slice = createSlice({
  name: 'system',
  initialState,
  reducers: {},
  extraReducers: ({ addCase }) => {
    addCase(connectWallet.fulfilled, (_, { payload }) => payload);
    addCase(disconnectWallet.fulfilled, (_, { payload }) => payload);
    addCase(reconnectWallet.fulfilled, (_, { payload }) => payload);
  }
});

export default slice;
