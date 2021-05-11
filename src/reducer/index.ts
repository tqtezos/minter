import { combineReducers, configureStore } from '@reduxjs/toolkit';
import {
  useSelector as baseUseSelector,
  useDispatch as baseUseDispatch
} from 'react-redux';
import collectionsSlice from './slices/collections';
import createNftSlice from './slices/createNft';
import createNftCsvImportSlice from './slices/createNftCsvImport';
import systemSlice from './slices/system';
import statusSlice from './slices/status';
import notificationsSlice from './slices/notifications';
import marketplaceSlice from './slices/marketplace';

export const reducer = combineReducers({
  collections: collectionsSlice.reducer,
  marketplace: marketplaceSlice.reducer,
  createNft: createNftSlice.reducer,
  createNftCsvImport: createNftCsvImportSlice.reducer,
  system: systemSlice.reducer,
  status: statusSlice.reducer,
  notifications: notificationsSlice.reducer
});

export const store = configureStore({
  reducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      immutableCheck: {
        ignoredPaths: ['system']
      },
      serializableCheck: {
        ignoredPaths: ['system'],
        ignoredActions: [
          'wallet/connect/fulfilled',
          'wallet/reconnect/fulfilled',
          'wallet/disconnect/fulfilled'
        ]
      }
    })
});

export type State = ReturnType<typeof reducer>;
export type Dispatch = typeof store.dispatch;
export const useDispatch = () => baseUseDispatch<Dispatch>();

export function useSelector<TSelect = unknown>(
  selector: (s: State) => TSelect,
  equalityFn?: (left: TSelect, right: TSelect) => boolean
) {
  return baseUseSelector<State, TSelect>(selector, equalityFn);
}
