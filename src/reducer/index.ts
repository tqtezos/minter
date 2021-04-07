import { combineReducers, getDefaultMiddleware } from '@reduxjs/toolkit';
import {
  useSelector as baseUseSelector,
  useDispatch as baseUseDispatch,
} from 'react-redux';
import { MakeStore, createWrapper, Context } from 'next-redux-wrapper';
import { applyMiddleware, createStore } from 'redux';
import collectionsSlice from './slices/collections';
import createNftSlice from './slices/createNft';
import systemSlice from './slices/system';
import statusSlice from './slices/status';
import notificationsSlice from './slices/notifications';
import marketplaceSlice from './slices/marketplace';
import thunk from 'redux-thunk';
import { persistStore, persistReducer, createTransform ,   FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,} from 'redux-persist';
import storage from "redux-persist/lib/storage";
import { JsogService } from 'jsog-typescript';
const JSOG = new JsogService();

export const JSOGTransform = createTransform(
  (inboundState, key) => JSOG.serialize(Object.create(inboundState as object)),
  (outboundState, key) => JSOG.deserialize(Object.create(outboundState as object)),
)

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
        'wallet/disconnect/fulfilled',
        FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER
      ],
    },
  })];


const persistConfig = {
  key: "root",
  storage: storage,
  transforms: [JSOGTransform],
};

const persistedReducer = persistReducer(persistConfig, reducer);
export const store = createStore(
  persistedReducer,
  applyMiddleware(...middleware));
export const persistor = persistStore(store);


export type State = ReturnType<typeof reducer>;
let dispatch = store.dispatch;
export type Dispatch = typeof dispatch;
export const useDispatch = () => baseUseDispatch<Dispatch>();
export function useSelector<TSelect = unknown>(
  selector: (s: State) => TSelect,
  equalityFn?: (left: TSelect, right: TSelect) => boolean
) {
  return baseUseSelector<State, TSelect>(selector, equalityFn);
}

// create a makeStore function
const makeStore: MakeStore<State> = (context: Context) => createStore(persistedReducer, applyMiddleware(...middleware));

// export an assembled wrapper
export const wrapper = createWrapper<State>(makeStore, {debug: true});