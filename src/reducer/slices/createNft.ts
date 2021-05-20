import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { NftMetadataAttribute } from '../../lib/nfts/decoders';
import { readFileAsDataUrlAction } from '../async/actions';

// State

type Step = 'file_upload' | 'asset_details' | 'collection_select' | 'confirm';

export const steps: Step[] = ['file_upload', 'asset_details', 'confirm'];

interface Fields {
  name: string | null;
  description: string | null;
  amount: number;
}

export enum CreateStatus {
  Ready = 'ready',
  InProgress = 'inProgress',
  Complete = 'complete'
}

export interface SelectedFile {
  objectUrl: string;
  name: string;
  type: string;
  size: number;
}

export interface UploadedArtifact {
  artifactUri: string;
  thumbnailUri: string;
}

export interface CreateNftState {
  step: Step;
  selectedFile: SelectedFile | null;
  displayImageFile: SelectedFile | null;
  uploadedArtifact: UploadedArtifact | null;
  fields: Fields;
  attributes: Array<NftMetadataAttribute>;
  collectionAddress: string | null;
  createStatus: CreateStatus;
}

export const initialState: CreateNftState = {
  step: 'file_upload',
  selectedFile: null,
  displayImageFile: null,
  uploadedArtifact: null,
  fields: {
    name: null,
    description: null,
    amount: 1
  },
  attributes: [],
  collectionAddress: null,
  createStatus: CreateStatus.Ready
};

// Async Thunks

// Reducers & Slice

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
    updateName(state, action: PayloadAction<string>) {
      state.fields.name = action.payload;
    },
    updateDescription(state, action: PayloadAction<string>) {
      state.fields.description = action.payload;
    },
    updateAmount(state, action: PayloadAction<number>) {
      state.fields.amount = action.payload;
    },
    updateSelectedFile(state, action: PayloadAction<SelectedFile>) {
      state.selectedFile = action.payload;
    },
    clearSelectedfile(state) {
      state.selectedFile = null;
    },
    updateDisplayImageFile(state, action: PayloadAction<SelectedFile>) {
      state.displayImageFile = action.payload;
    },
    clearDisplayImagFile(state) {
      state.displayImageFile = null;
    },
    addMetadataRow(state) {
      state.attributes.push({ name: '', value: '' });
    },
    updateMetadataRowName(state, action: UpdateRowNameAction) {
      if (state.attributes[action.payload.key]) {
        state.attributes[action.payload.key].name = action.payload.name;
      }
    },
    updateMetadataRowValue(state, action: UpdateRowValueAction) {
      if (state.attributes[action.payload.key]) {
        state.attributes[action.payload.key].value = action.payload.value;
      }
    },
    deleteMetadataRow(state, action: PayloadAction<{ key: number }>) {
      state.attributes.splice(action.payload.key, 1);
    },
    selectCollection(state, action: PayloadAction<string>) {
      state.collectionAddress = action.payload;
    },
    setCreateStatus(state, action: PayloadAction<CreateStatus>) {
      state.createStatus = action.payload;
    },
    clearForm() {
      return initialState;
    }
  },
  extraReducers: ({ addCase }) => {
    addCase(readFileAsDataUrlAction.fulfilled, (state, action) => {
      if (action.payload.ns === 'createNft') {
        state.selectedFile = action.payload.result;
      }
    });
  }
});

export const {
  incrementStep,
  decrementStep,
  updateName,
  updateDescription,
  updateAmount,
  updateSelectedFile,
  clearSelectedfile,
  updateDisplayImageFile,
  addMetadataRow,
  updateMetadataRowName,
  updateMetadataRowValue,
  deleteMetadataRow,
  selectCollection,
  setCreateStatus,
  clearForm
} = slice.actions;

export default slice;
