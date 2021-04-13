import { createSlice } from '@reduxjs/toolkit';
import {
  pushNotification,
  readNotification,
  deliverNotification
} from './notificationsActions';
import {
  createAssetContractAction,
  mintTokenAction,
  transferTokenAction,
  listTokenAction,
  cancelTokenSaleAction,
  buyTokenAction
} from '../async/actions';
import { connectWallet, disconnectWallet } from '../async/wallet';
import {
  getContractNftsQuery,
  getNftAssetContractQuery,
  getWalletAssetContractsQuery
} from '../async/queries';
import { ErrorKind } from '../async/errors';

export interface Notification {
  requestId: string;
  read: boolean;
  delivered: boolean;
  status: 'success' | 'pending' | 'error';
  title: string;
  description: string;
  kind: ErrorKind | null;
}

export type NotificationState = Notification[];

const initialState: NotificationState = [];

const slice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {},
  extraReducers: ({ addCase }) => {
    addCase(pushNotification, (state, { payload }) => {
      state.push(payload);
    });

    addCase(readNotification, (state, { payload: requestId }) => {
      return state.map(n => {
        return n.requestId === requestId ? { ...n, read: true } : n;
      });
    });

    addCase(deliverNotification, (state, { payload: requestId }) => {
      return state.map(n => {
        return n.requestId === requestId ? { ...n, delivered: true } : n;
      });
    });

    // Action errors are abstracted by their payloads. This allows us to iterate
    // through a list of actions and assign a notification without individually
    // matching against each one through `addCase`
    [
      createAssetContractAction,
      mintTokenAction,
      transferTokenAction,
      listTokenAction,
      cancelTokenSaleAction,
      buyTokenAction,
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

export default slice;
