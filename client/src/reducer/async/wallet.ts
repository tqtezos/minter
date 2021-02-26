import { createAsyncThunk } from '@reduxjs/toolkit';
import { State } from '..';
import { Minter, SystemWithToolkit, SystemWithWallet } from '../../lib/system';
import { ErrorKind, RejectValue } from './errors';

type Options = {
  state: State;
  rejectValue: RejectValue;
};

export const connectWallet = createAsyncThunk<
  SystemWithWallet,
  undefined,
  Options
>(
  'wallet/connect',
  async (_arg, { getState, rejectWithValue /* , dispatch */ }) => {
    const { system } = getState();
    if (system.status === 'ToolkitConnected') {
      // TODO: Implement custom UI behavior by overriding Beacon events
      // NOTE: These event handlers will be passed to the Beacon DAppClient *once*
      // as the client is cached after its first instantiation
      // eslint-disable-next-line
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
      try {
        return await Minter.connectWallet(system /*eventHandlers*/);
      } catch (e) {
        return rejectWithValue({
          kind: ErrorKind.WalletPermissionRequestDenied,
          message: 'Wallet permission request denied'
        });
      }
    }
    return rejectWithValue({
      kind: ErrorKind.WalletNotConnected,
      message: 'Wallet already connected'
    });
  }
);

export const reconnectWallet = createAsyncThunk<
  SystemWithWallet | SystemWithToolkit,
  undefined,
  Options
>('wallet/reconnect', async (_arg, { getState, rejectWithValue }) => {
  const { system } = getState();
  if (system.status === 'ToolkitConnected') {
    return await Minter.reconnectWallet(system);
  }
  return rejectWithValue({
    kind: ErrorKind.WalletNotConnected,
    message: 'Wallet already connected'
  });
});

export const disconnectWallet = createAsyncThunk<
  SystemWithToolkit,
  undefined,
  Options
>('wallet/disconnect', async (_arg, { getState, rejectWithValue }) => {
  const { system } = getState();
  if (system.status === 'WalletConnected') {
    return await Minter.disconnectWallet(system);
  }
  return rejectWithValue({
    kind: ErrorKind.WalletNotConnected,
    message: 'No wallet to disconnect from '
  });
});
