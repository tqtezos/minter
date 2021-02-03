import { createAsyncThunk } from '@reduxjs/toolkit';
import { State } from '..';
import { Minter, SystemWithToolkit, SystemWithWallet } from '../../lib/system';

export const connectWallet = createAsyncThunk<
  SystemWithWallet,
  undefined,
  { state: State }
>('wallet/connect', async (_arg, { getState, rejectWithValue, dispatch }) => {
  const { system } = getState();
  if (system.status === 'ToolkitConnected') {
    // NOTE: These event handlers will be passed to the Beacon DAppClient *once*
    // as the client is cached after its first instantiation
    const eventHandlers: Parameters<typeof Minter.connectWallet>[1] = {
      PERMISSION_REQUEST_SENT: {
        handler(data) {
          console.log(data);
        }
      },
      PERMISSION_REQUEST_SUCCESS: {
        handler(data) {
          console.log(data);
        }
      },
      PERMISSION_REQUEST_ERROR: {
        handler(data) {
          console.log(data);
        }
      },
      OPERATION_REQUEST_SENT: {
        handler(data) {
          console.log(data);
        }
      },
      OPERATION_REQUEST_SUCCESS: {
        handler(data) {
          console.log(data);
        }
      },
      OPERATION_REQUEST_ERROR: {
        handler(data) {
          console.log(data);
        }
      },
      ACKNOWLEDGE_RECEIVED: {
        handler(data) {
          console.log(data);
        }
      }
    };
    return await Minter.connectWallet(system /*eventHandlers*/);
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
