import { createSlice, PayloadAction, SerializedError } from '@reduxjs/toolkit';
import {
  createAssetContractAction,
  mintTokenAction,
  transferTokenAction,
  listTokenAction,
  cancelTokenSaleAction,
  buyTokenAction
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
  contract?: String
}

export interface StatusState {
  createAssetContract: Status;
  mintToken: Array<Status>;
  transferToken: Status;
  listToken: Status;
  cancelTokenSale: Status;
  buyToken: Status;
  getContractNfts: Status;
  getNftAssetContract: Status;
  getWalletAssetContracts: Status;
}

type Method = keyof StatusState;

const defaultStatus: Status = { status: 'ready', error: null };

const initialState: StatusState = {
  createAssetContract: defaultStatus,
  mintToken: [],
  transferToken: defaultStatus,
  listToken: defaultStatus,
  cancelTokenSale: defaultStatus,
  buyToken: defaultStatus,
  getContractNfts: defaultStatus,
  getNftAssetContract: defaultStatus,
  getWalletAssetContracts: defaultStatus
};

type SetStatusAction = PayloadAction<{ method: Method; status: StatusKey, contract?: String }>;
type ClearErrorAction = PayloadAction<{ method: Method }>;

function methodMap<A>(method: keyof StatusState, action: A, contract?: String) {
  return { method, action, contract };
}

const slice = createSlice({
  name: 'status',
  initialState,
  reducers: {
    setStatus(state, { payload }: SetStatusAction) {
      if(payload.method === 'mintToken') {
        if (!(state[payload.method] as Array<Status>).filter(c => c.contract).length) {
          (state[payload.method] as Array<Status>).push({status: payload.status, error: null, contract: payload.contract });
        } else {
          state[payload.method] = (state[payload.method]).map(c => {
            if(c.contract === payload.contract) {
              c.status = payload.status;
            }
            return c;
          }) as Array<Status>;
        }
      } else {
        (state[payload.method] as any).status = payload.status;
      }
    },
    clearError(state, { payload }: ClearErrorAction) {
      (state[payload.method] as any).error = null;
    }
  },
  extraReducers: ({ addCase }) => {
    [
      methodMap('createAssetContract', createAssetContractAction),
      methodMap('mintToken', mintTokenAction),
      methodMap('transferToken', transferTokenAction),
      methodMap('listToken', listTokenAction),
      methodMap('cancelTokenSale', cancelTokenSaleAction),
      methodMap('buyToken', buyTokenAction),
      methodMap('getContractNfts', getContractNftsQuery),
      methodMap('getNftAssetContract', getNftAssetContractQuery),
      methodMap('getWalletAssetContracts', getWalletAssetContractsQuery)
    ].forEach(({ method, action }) => {
      addCase(action.pending, (state, a) => {
        if(method === 'mintToken') {
          if (!(state[method] as Array<Status>).filter(c => c.contract === a?.meta?.requestId).length) {
            (state[method] as Array<Status>).push({status: 'in_transit', error: null, contract: a?.meta?.requestId });
          } else {
            state[method] = (state[method] as Array<Status>).map(c => {
              if(c.contract === a?.meta?.requestId) {
                c.status = 'in_transit';
              }
              return c;
            }) as Array<Status>;
          }
        } else {
          (state[method] as any).status = 'in_transit';
        }
      });
      addCase(action.fulfilled, (state, a) => {
        if(method === 'mintToken') {
          state[method] = (state[method]).map(c => {
            if(c.contract === a?.meta?.requestId) {
              c.status = 'complete';
            }
            return c;
          }) as Array<Status>;
        } else {
          (state[method] as any).status = 'complete';
        }
      });
      addCase(action.rejected, (state, a) => {
        const rejectValue = a.payload
          ? a.payload
          : {
              kind: ErrorKind.UknownError,
              message: 'Unknown error'
            };

            if(method === 'mintToken') {
              state[method] = (state[method]).map(c => {
                if(c.contract === (action.rejected as any)?.contract) {
                  c.error = {
                    rejectValue,
                    serialized: a.error
                  };
                }
                return c;
              }) as Array<Status>;
            } else {
              (state[method] as any).error = {
                rejectValue,
                serialized: a.error
              };
            }
      });
    });
  }
});

export const { setStatus, clearError } = slice.actions;

export default slice;
