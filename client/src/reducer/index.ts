import { combineReducers, configureStore } from '@reduxjs/toolkit';
import {
  useSelector as baseUseSelector,
  useDispatch as baseUseDispatch
} from 'react-redux';
import collectionsSlice from './slices/collections';
import createNftSlice from './slices/createNft';
import systemSlice from './slices/system';

export const reducer = combineReducers({
  collections: collectionsSlice.reducer,
  createNft: createNftSlice.reducer,
  system: systemSlice.reducer
});

export const store = configureStore({
  reducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      immutableCheck: {
        ignoredPaths: ['system']
      }
    })
});

export type State = ReturnType<typeof reducer>;
export type Dispatch = typeof store.dispatch;

export function useDispatch() {
  return baseUseDispatch<Dispatch>();
}

export function useSelector<TSelect = unknown>(
  selector: (s: State) => TSelect,
  equalityFn?: (left: TSelect, right: TSelect) => boolean
) {
  return baseUseSelector<State, TSelect>(selector, equalityFn);
}
