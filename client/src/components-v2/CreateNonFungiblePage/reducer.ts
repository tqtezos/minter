import { Dispatch } from 'react';

export type Action =
  | { type: 'update_field'; payload: { name: string; value: string } }
  | { type: 'add_metadata_row' }
  | {
      type: 'update_metadata_row';
      payload: { key: number; name: string; value: string };
    };

export interface State {
  fields: {
    name: string | null;
    description: string | null;
    ipfs_hash: string | null;
  };
  metadata_rows: { name: string | null; value: string | null }[];
}

export type DispatchFn = Dispatch<Action>;

export const initialState: State = {
  fields: {
    name: null,
    description: null,
    ipfs_hash: null
  },
  metadata_rows: []
};

export function reducer(state: State, action: Action) {
  switch (action.type) {
    case 'update_field':
      const { name, value } = action.payload;
      return { ...state, fields: { ...state.fields, [name]: value } };
    default:
      return state;
  }
}
