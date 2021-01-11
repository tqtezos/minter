import { Dispatch } from 'react';

export type Action =
  | { type: 'increment_step' }
  | { type: 'decrement_step' }
  | { type: 'update_field'; payload: { name: string; value: string } }
  | { type: 'add_metadata_row' }
  | {
      type: 'update_metadata_row';
      payload: { key: number; name: string; value: string };
    }
  | { type: 'select_collection'; payload: { address: string } };

type Step = 'file_upload' | 'asset_details' | 'collection_select';

export const steps: Step[] = [
  'file_upload',
  'asset_details',
  'collection_select'
];

export interface State {
  step: Step;
  fields: {
    name: string | null;
    description: string | null;
    ipfs_hash: string | null;
  };
  metadataRows: { name: string | null; value: string | null }[];
  collectionAddress: string | null;
}

export type DispatchFn = Dispatch<Action>;

export const initialState: State = {
  step: 'file_upload',
  fields: {
    name: null,
    description: null,
    ipfs_hash: null
  },
  metadataRows: [],
  collectionAddress: null
};

export function reducer(state: State, action: Action) {
  switch (action.type) {
    case 'increment_step': {
      const stepIdx = steps.indexOf(state.step);
      if (stepIdx + 1 < steps.length) {
        return { ...state, step: steps[stepIdx + 1] };
      }
      return state;
    }
    case 'decrement_step': {
      const stepIdx = steps.indexOf(state.step);
      if (stepIdx > 0) {
        return { ...state, step: steps[stepIdx - 1] };
      }
      return state;
    }
    case 'update_field': {
      const { name, value } = action.payload;
      return { ...state, fields: { ...state.fields, [name]: value } };
    }
    case 'select_collection': {
      const { address } = action.payload;
      return { ...state, collectionAddress: address };
    }
    default:
      return state;
  }
}
