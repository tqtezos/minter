import { Dispatch } from 'react';
import produce from 'immer';
import Joi from 'joi';

type Step = 'file_upload' | 'asset_details' | 'collection_select';

export const steps: Step[] = [
  'file_upload',
  'asset_details',
  'collection_select'
];

interface Fields {
  name: string | null;
  description: string | null;
}

export enum CreateStatus {
  Ready = 'ready',
  InProgress = 'inProgress',
  Complete = 'complete'
}

export interface State {
  step: Step;
  artifactUri: string | null;
  fields: Fields;
  metadataRows: { name: string | null; value: string | null }[];
  collectionAddress: string | null;
  createStatus: CreateStatus;
}

export const fileUploadSchema = Joi.object({
  artifactUri: Joi.string().required()
});

export const assetDetailsSchema = fileUploadSchema.append({
  fields: Joi.object({
    name: Joi.string().min(1).required(),
    description: Joi.string().allow(null).allow('')
  }),
  metadataRows: Joi.array().items(
    Joi.object({
      name: Joi.string().min(1).required(),
      value: Joi.string().min(1).required()
    })
  )
});

export const collectionSelectSchema = assetDetailsSchema.append({
  collectionAddress: Joi.string().required()
});

export type Action =
  | { type: 'increment_step' }
  | { type: 'decrement_step' }
  | { type: 'update_field'; payload: { name: keyof Fields; value: string } }
  | { type: 'update_artifact_uri'; payload: { value: string } }
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
  | { type: 'select_collection'; payload: { address: string } }
  | { type: 'set_create_status'; payload: { status: CreateStatus } };

export type DispatchFn = Dispatch<Action>;

export const initialState: State = {
  step: 'file_upload',
  artifactUri: null,
  fields: {
    name: null,
    description: null
  },
  metadataRows: [],
  collectionAddress: null,
  createStatus: CreateStatus.Ready
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
    case 'update_artifact_uri': {
      const { value } = action.payload;
      return produce(state, draftState => {
        draftState.artifactUri = value;
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
    case 'set_create_status': {
      const { status } = action.payload;
      return produce(state, draftState => {
        draftState.createStatus = status;
      });
    }
    default:
      return state;
  }
}
