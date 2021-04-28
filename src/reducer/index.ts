import { combineReducers, configureStore } from '@reduxjs/toolkit';
import {
  useSelector as baseUseSelector,
  useDispatch as baseUseDispatch
} from 'react-redux';
import collectionsSlice from './slices/collections';
import createNftSlice from './slices/createNft';
import systemSlice from './slices/system';
import statusSlice from './slices/status';
import notificationsSlice from './slices/notifications';
import marketplaceSlice from './slices/marketplace';
import storage from "redux-persist/lib/storage";
import {
  persistStore, persistReducer, createTransform,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER
} from 'redux-persist';
import JSOG from 'jsog';

export const reducer = combineReducers({
  collections: collectionsSlice.reducer,
  marketplace: marketplaceSlice.reducer,
  createNft: createNftSlice.reducer,
  system: systemSlice.reducer,
  status: statusSlice.reducer,
  notifications: notificationsSlice.reducer
});

export const JSOGTransform = createTransform(
    (inboundState, key) => JSOG.encode(inboundState),
    (outboundState, key) => JSOG.decode(outboundState),
)

const persistConfig = {
  key: "App",
  version: 1,
  storage,
  transforms: [JSOGTransform]
};

const persistedReducer = persistReducer(persistConfig, reducer);

export const store = configureStore({
  reducer: persistedReducer,
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
          'wallet/disconnect/fulfilled',
          FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER
        ]
      }
    })
});

export const persistor = persistStore(store);

export type State = ReturnType<typeof reducer>;
export type Dispatch = typeof store.dispatch;
export const useDispatch = () => baseUseDispatch<Dispatch>();

export function useSelector<TSelect = unknown>(
  selector: (s: State) => TSelect,
  equalityFn?: (left: TSelect, right: TSelect) => boolean
) {
  return baseUseSelector<State, TSelect>(selector, equalityFn);
}

