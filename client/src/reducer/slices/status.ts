import { createSlice, PayloadAction, SerializedError } from '@reduxjs/toolkit';
import {
  createAssetContractAction,
  mintTokenAction,
  transferTokenAction
} from '../async/actions';
import {
  getContractNftsQuery,
  getNftAssetContractQuery,
  getWalletAssetContractsQuery
} from '../async/queries';

export type StatusKey = 'ready' | 'in_transit' | 'complete';

interface Status {
  status: StatusKey;
  error: SerializedError | null;
}

export interface StatusState {
  createAssetContract: Status;
  mintToken: Status;
  transferToken: Status;
  getContractNfts: Status;
  getNftAssetContract: Status;
  getWalletAssetContracts: Status;
}

type Name = keyof StatusState;

const defaultStatus: Status = { status: 'ready', error: null };

const initialState: StatusState = {
  createAssetContract: defaultStatus,
  mintToken: defaultStatus,
  transferToken: defaultStatus,
  getContractNfts: defaultStatus,
  getNftAssetContract: defaultStatus,
  getWalletAssetContracts: defaultStatus
};

type SetStatusAction = PayloadAction<{ method: Name; status: StatusKey }>;
type SetErrorAction = PayloadAction<{ method: Name; message: string }>;
type ClearErrorAction = PayloadAction<{ method: Name }>;

const slice = createSlice({
  name: 'status',
  initialState,
  reducers: {
    setStatus(state, { payload }: SetStatusAction) {
      state[payload.method].status = payload.status;
    },
    setError(state, { payload }: SetErrorAction) {
      state[payload.method].error = { message: payload.message };
    },
    clearError(state, { payload }: ClearErrorAction) {
      state[payload.method].error = null;
    }
  },
  extraReducers: ({ addCase }) => {
    [
      { method: 'createAssetContract', action: createAssetContractAction },
      { method: 'mintToken', action: mintTokenAction },
      { method: 'transferToken', action: transferTokenAction },
      { method: 'getContractNfts', action: getContractNftsQuery },
      { method: 'getNftAssetContract', action: getNftAssetContractQuery },
      {
        method: 'getWalletAssetContracts',
        action: getWalletAssetContractsQuery
      }
    ].forEach(({ method, action }) => {
      const name = method as keyof StatusState;
      addCase(action.pending, state => {
        state[name].status = 'in_transit';
      });
      addCase(action.fulfilled, state => {
        state[name].status = 'complete';
      });
      addCase(action.rejected, (state, action) => {
        state[name].error = action.error;
      });
    });
  }
});

export const { setStatus, setError, clearError } = slice.actions;

export default slice;
