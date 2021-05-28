import { createSlice, PayloadAction, SerializedError } from '@reduxjs/toolkit';
import {
  createAssetContractAction,
  mintTokenAction,
  transferTokenAction,
  listTokenAction,
  cancelTokenSaleAction,
  buyTokenAction,
  mintCsvTokensAction
} from '../async/actions';
import {
  getContractNftsQuery,
  getNftAssetContractQuery,
  getWalletAssetContractsQuery
} from '../async/queries';
import { ErrorKind, RejectValue } from '../async/errors';

export type StatusKey = 'ready' | 'in_transit' | 'complete';

export interface Status {
  status: StatusKey;
  error: {
    rejectValue: RejectValue;
    serialized: SerializedError;
  } | null;
}

export interface StatusState {
  createAssetContract: Status;
  mintToken: Status;
  mintCsvTokens: Status;
  transferToken: Status;
  listToken: Status;
  cancelTokenSale: Status;
  buyToken: Status;
  getContractNfts: Status;
  getNftAssetContract: Status;
  getWalletAssetContracts: Status;
}

export type Method = keyof StatusState;

const defaultStatus: Status = { status: 'ready', error: null };

const initialState: StatusState = {
  createAssetContract: defaultStatus,
  mintToken: defaultStatus,
  mintCsvTokens: defaultStatus,
  transferToken: defaultStatus,
  listToken: defaultStatus,
  cancelTokenSale: defaultStatus,
  buyToken: defaultStatus,
  getContractNfts: defaultStatus,
  getNftAssetContract: defaultStatus,
  getWalletAssetContracts: defaultStatus
};

type SetStatusAction = PayloadAction<{ method: Method; status: StatusKey }>;
type ClearErrorAction = PayloadAction<{ method: Method }>;

function methodMap<A>(method: keyof StatusState, action: A) {
  return { method, action };
}

const slice = createSlice({
  name: 'status',
  initialState,
  reducers: {
    setStatus(state, { payload }: SetStatusAction) {
      state[payload.method].status = payload.status;
    },
    clearError(state, { payload }: ClearErrorAction) {
      state[payload.method].error = null;
    }
  },
  extraReducers: ({ addCase }) => {
    [
      methodMap('createAssetContract', createAssetContractAction),
      methodMap('mintToken', mintTokenAction),
      methodMap('mintCsvTokens', mintCsvTokensAction),
      methodMap('transferToken', transferTokenAction),
      methodMap('listToken', listTokenAction),
      methodMap('cancelTokenSale', cancelTokenSaleAction),
      methodMap('buyToken', buyTokenAction),
      methodMap('getContractNfts', getContractNftsQuery),
      methodMap('getNftAssetContract', getNftAssetContractQuery),
      methodMap('getWalletAssetContracts', getWalletAssetContractsQuery)
    ].forEach(({ method, action }) => {
      addCase(action.pending, state => {
        state[method].status = 'in_transit';
      });
      addCase(action.fulfilled, state => {
        state[method].status = 'complete';
      });
      addCase(action.rejected, (state, action) => {
        const rejectValue = action.payload
          ? action.payload
          : {
              kind: ErrorKind.UnknownError,
              message: 'Unknown error'
            };
        state[method].error = {
          rejectValue,
          serialized: action.error
        };
      });
    });
  }
});

export const { setStatus, clearError } = slice.actions;

export default slice;
