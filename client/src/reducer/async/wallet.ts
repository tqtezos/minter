import { createAsyncThunk } from '@reduxjs/toolkit';
import { State } from '..';
import { Minter, SystemWithToolkit, SystemWithWallet } from '../../lib/system';

export const connectWallet = createAsyncThunk<
  SystemWithWallet,
  undefined,
  { state: State }
>('wallet/connect', async (_arg, { getState, rejectWithValue }) => {
  const { system } = getState();
  if (system.status === 'ToolkitConnected') {
    return await Minter.connectWallet(system);
  }
  return rejectWithValue({ error: 'Wallet already connected' });
});

export const disconnectWallet = createAsyncThunk<
  SystemWithToolkit,
  undefined,
  { state: State }
>('wallet/disconnect', async (_arg, { getState, rejectWithValue }) => {
  const { system } = getState();
  if (system.status === 'WalletConnected') {
    return await Minter.disconnectWallet(system);
  }
  return rejectWithValue({ error: 'No wallet connected' });
});
