import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  createAssetContractAction,
  mintTokenAction,
  transferTokenAction
} from '../async/actions';
import { connectWallet, disconnectWallet } from '../async/wallet';
import {
  getContractNftsQuery,
  getNftAssetContractQuery,
  getWalletAssetContractsQuery
} from '../async/queries';
import { ErrorKind } from '../async/errors';

interface Notification {
  requestId: string;
  read: boolean;
  delivered: boolean;
  status: 'success' | 'warning' | 'error';
  title: string;
  description: string;
  kind: ErrorKind;
}

export type NotificationState = Notification[];

const initialState: NotificationState = [];

const slice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    readNotification(state, { payload: requestId }: PayloadAction<string>) {
      for (let notification of state) {
        if (notification.requestId === requestId) {
          notification.read = true;
          break;
        }
      }
    },
    deliverNotification(state, { payload: requestId }: PayloadAction<string>) {
      for (let notification of state) {
        if (notification.requestId === requestId) {
          notification.delivered = true;
          break;
        }
      }
    }
  },
  extraReducers: ({ addCase }) => {
    [
      createAssetContractAction,
      mintTokenAction,
      transferTokenAction,
      getContractNftsQuery,
      getNftAssetContractQuery,
      getWalletAssetContractsQuery,
      connectWallet,
      disconnectWallet
    ].forEach(action => {
      addCase(action.rejected, (state, { meta, payload }) => {
        if (!payload) {
          return;
        }
        state.push({
          requestId: meta.requestId,
          read: false,
          delivered: false,
          status: 'error',
          title: 'Error',
          description: payload.message,
          kind: payload.kind
        });
      });
    });
  }
});

export const { readNotification, deliverNotification } = slice.actions;

export default slice;
