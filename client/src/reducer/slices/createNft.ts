import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// State

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

export interface CreateNftState {
  step: Step;
  artifactUri: string | null;
  fields: Fields;
  metadataRows: { name: string | null; value: string | null }[];
  collectionAddress: string | null;
  createStatus: CreateStatus;
}

export const initialState: CreateNftState = {
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

// Async Thunks

// Reducers & Slice

type UpdateFieldAction = PayloadAction<{ name: keyof Fields; value: string }>;
type UpdateRowNameAction = PayloadAction<{ key: number; name: string }>;
type UpdateRowValueAction = PayloadAction<{ key: number; value: string }>;

const slice = createSlice({
  name: 'createNft',
  initialState,
  reducers: {
    incrementStep(state) {
      const stepIdx = steps.indexOf(state.step);
      if (stepIdx + 1 < steps.length) {
        state.step = steps[stepIdx + 1];
      }
    },
    decrementStep(state) {
      const stepIdx = steps.indexOf(state.step);
      if (stepIdx > 0) {
        state.step = steps[stepIdx - 1];
      }
    },
    updateField(state, action: UpdateFieldAction) {
      state.fields[action.payload.name] = action.payload.value;
    },
    updateArtifactUri(state, action: PayloadAction<string>) {
      state.artifactUri = action.payload;
    },
    addMetadataRow(state) {
      state.metadataRows.push({ name: null, value: null });
    },
    updateMetadataRowName(state, action: UpdateRowNameAction) {
      if (state.metadataRows[action.payload.key]) {
        state.metadataRows[action.payload.key].name = action.payload.name;
      }
    },
    updateMetadataRowValue(state, action: UpdateRowValueAction) {
      if (state.metadataRows[action.payload.key]) {
        state.metadataRows[action.payload.key].value = action.payload.value;
      }
    },
    deleteMetadataRow(state, action: PayloadAction<{ key: number }>) {
      state.metadataRows.splice(action.payload.key, 1);
    },
    selectCollection(state, action: PayloadAction<string>) {
      state.collectionAddress = action.payload;
    },
    setCreateStatus(state, action: PayloadAction<CreateStatus>) {
      state.createStatus = action.payload;
    }
  }
});

export const {
  incrementStep,
  decrementStep,
  updateField,
  updateArtifactUri,
  addMetadataRow,
  updateMetadataRowName,
  updateMetadataRowValue,
  deleteMetadataRow,
  selectCollection,
  setCreateStatus
} = slice.actions;

export default slice;
