import { Dispatch } from 'react';
import produce from 'immer';

type Step = 'file_upload' | 'asset_details' | 'collection_select';

export const steps: Step[] = [
  'file_upload',
  'asset_details',
  'collection_select'
];

interface Fields {
  name: string | null;
  description: string | null;
  ipfs_hash: string | null;
}

export interface State {
  step: Step;
  fields: Fields;
  metadataRows: { name: string | null; value: string | null }[];
  collectionAddress: string | null;
}

export type Action =
  | { type: 'increment_step' }
  | { type: 'decrement_step' }
  | { type: 'update_field'; payload: { name: keyof Fields; value: string } }
  | { type: 'add_metadata_row' }
  | {
      type: 'update_metadata_row_name';
      payload: { key: number; name: string };
    }
  | {
      type: 'update_metadata_row_value';
      payload: { key: number; value: string };
    }
  | { type: 'delete_metadata_row'; payload: { key: number } }
  | { type: 'select_collection'; payload: { address: string } };

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
        return produce(state, draftState => {
          draftState.step = steps[stepIdx + 1];
        });
      }
      return state;
    }
    case 'decrement_step': {
      const stepIdx = steps.indexOf(state.step);
      if (stepIdx > 0) {
        return produce(state, draftState => {
          draftState.step = steps[stepIdx - 1];
        });
      }
      return state;
    }
    case 'update_field': {
      const { name, value } = action.payload;
      return produce(state, draftState => {
        draftState.fields[name] = value;
      });
    }
    case 'add_metadata_row': {
      return produce(state, draftState => {
        draftState.metadataRows.push({ name: null, value: null });
      });
    }
    case 'update_metadata_row_name': {
      const { key, name } = action.payload;
      if (!state.metadataRows[key]) {
        return state;
      }
      return produce(state, draftState => {
        draftState.metadataRows[key].name = name;
      });
    }
    case 'update_metadata_row_value': {
      const { key, value } = action.payload;
      if (!state.metadataRows[key]) {
        return state;
      }
      return produce(state, draftState => {
        draftState.metadataRows[key].value = value;
      });
    }
    case 'delete_metadata_row': {
      return produce(state, draftState => {
        draftState.metadataRows.splice(action.payload.key, 1);
      });
    }
    case 'select_collection': {
      const { address } = action.payload;
      return produce(state, draftState => {
        draftState.collectionAddress = address;
      });
    }
    default:
      return state;
  }
}
