import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { readFileAsDataUrlAction } from '../async/actions';

export interface SelectedFile {
  objectUrl: string;
  name: string;
  type: string;
  size: number;
}

export interface CreateNftCsvImportState {
  selectedCsvFile: SelectedFile | null;
}

export const initialState: CreateNftCsvImportState = {
  selectedCsvFile: null
};

const slice = createSlice({
  name: 'createNftCsvImport',
  initialState,
  reducers: {
    updateSelectedCsvFile(state, action: PayloadAction<SelectedFile>) {
      state.selectedCsvFile = action.payload;
    },
    clearSelectedCsvFile(state) {
      state.selectedCsvFile = null;
    }
  },
  extraReducers: ({ addCase }) => {
    addCase(readFileAsDataUrlAction.fulfilled, (state, action) => {
      if (action.payload.ns === 'createNftCsvImport') {
        state.selectedCsvFile = action.payload.result;
      }
    });
  }
});

export const { updateSelectedCsvFile, clearSelectedCsvFile } = slice.actions;

export default slice;
