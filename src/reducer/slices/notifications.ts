import { createSlice, PayloadAction } from '@reduxjs/toolkit';
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

interface Notification {
  requestId: string;
  read: boolean;
  delivered: boolean;
  status: 'success' | 'warning' | 'error';
  title: string;
  description: string;
  kind: ErrorKind | null;
}

export type NotificationState = Notification[];

const initialState: NotificationState = [];

function pendingNotification(
  requestId: string,
  description: string
): Notification {
  return {
    requestId,
    read: false,
    delivered: false,
    status: 'warning',
    title: 'Pending',
    description,
    kind: null
  };
}

function fulfilledNotification(
  requestId: string,
  description: string
): Notification {
  return {
    requestId,
    read: false,
    delivered: false,
    status: 'success',
    title: 'Complete',
    description,
    kind: null
  };
}

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
    // createAssetContract
    addCase(createAssetContractAction.pending, (state, { meta }) => {
      const description = `Creating asset contract with name ${meta.arg}`;
      state.push(pendingNotification(meta.requestId, description));
    });
    addCase(createAssetContractAction.fulfilled, (state, { payload, meta }) => {
      const description = `Created asset contract ${payload.name} (${payload.address})`;
      state.push(fulfilledNotification(meta.requestId, description));
    });

    // mintToken
    addCase(mintTokenAction.pending, (state, { meta }) => {
      const description = `Minting new token: ${meta.arg}`;
      state.push(pendingNotification(meta.requestId, description));
    });
    addCase(mintTokenAction.fulfilled, (state, { payload, meta }) => {
      const description = `Created new token: ${payload.metadata.name} in ${payload.contract}`;
      state.push(fulfilledNotification(meta.requestId, description));
    });

    // transferToken
    addCase(transferTokenAction.pending, (state, { meta }) => {
      const description = `Transferring token to ${meta.arg.to}`;
      state.push(pendingNotification(meta.requestId, description));
    });
    addCase(transferTokenAction.fulfilled, (state, { meta }) => {
      const description = `Transferred token to ${meta.arg.to}`;
      state.push(fulfilledNotification(meta.requestId, description));
    });

    // listToken
    addCase(listTokenAction.pending, (state, { meta }) => {
      const description = `Listing token for sale for ${meta.arg.salePrice}`;
      state.push(pendingNotification(meta.requestId, description));
    });
    addCase(listTokenAction.fulfilled, (state, { meta }) => {
      const description = `Token listed for sale for ${meta.arg.salePrice}`;
      state.push(fulfilledNotification(meta.requestId, description));
    });

    // cancelTokenSale
    addCase(cancelTokenSaleAction.pending, (state, { meta }) => {
      const description = `Canceling token sale`;
      state.push(pendingNotification(meta.requestId, description));
    });
    addCase(cancelTokenSaleAction.fulfilled, (state, { meta }) => {
      const description = `Token sale canceled`;
      state.push(fulfilledNotification(meta.requestId, description));
    });

    // buyToken
    addCase(buyTokenAction.pending, (state, { meta }) => {
      const description = `Buying token from ${meta.arg.tokenSeller} for ${meta.arg.salePrice}`;
      state.push(pendingNotification(meta.requestId, description));
    });
    addCase(buyTokenAction.fulfilled, (state, { meta }) => {
      const description = `Bought token from ${meta.arg.tokenSeller} for ${meta.arg.salePrice}`;
      state.push(fulfilledNotification(meta.requestId, description));
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

export const { readNotification, deliverNotification } = slice.actions;

export default slice;
