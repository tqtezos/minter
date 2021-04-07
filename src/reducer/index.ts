import { combineReducers, configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import {
  useSelector as baseUseSelector,
  useDispatch as baseUseDispatch
} from 'react-redux';
import { applyMiddleware, createStore } from 'redux';
import collectionsSlice from './slices/collections';
import createNftSlice from './slices/createNft';
import systemSlice from './slices/system';
import statusSlice from './slices/status';
import notificationsSlice from './slices/notifications';
import marketplaceSlice from './slices/marketplace';
import thunk from 'redux-thunk';

export const reducer = combineReducers({
  collections: collectionsSlice.reducer,
  marketplace: marketplaceSlice.reducer,
  createNft: createNftSlice.reducer,
  system: systemSlice.reducer,
  status: statusSlice.reducer,
  notifications: notificationsSlice.reducer
});

const middleware = [
  thunk,
  ...getDefaultMiddleware({
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
})];

export const store = createStore(
  reducer,
  applyMiddleware(...middleware)
);

export type State = ReturnType<typeof reducer>;
export type Dispatch = typeof store.dispatch;
export const useDispatch = () => baseUseDispatch<Dispatch>();

export function useSelector<TSelect = unknown>(
  selector: (s: State) => TSelect,
  equalityFn?: (left: TSelect, right: TSelect) => boolean
) {
  return baseUseSelector<State, TSelect>(selector, equalityFn);
}
