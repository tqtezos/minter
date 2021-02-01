import React, { useReducer } from 'react';
import { Route } from 'wouter';
import { reducer, initialState } from './reducer';
import CollectionsCatalog from '../Collections/Catalog';
import CollectionsTokenDetail from '../Collections/TokenDetail';

export default function Collections() {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <>
      <Route path="/collections">
        <CollectionsCatalog state={state} dispatch={dispatch} />
      </Route>
      <Route path="/collection/:contractAddress/token/:tokenId">
        {({ contractAddress, tokenId }) => (
          <CollectionsTokenDetail
            contractAddress={contractAddress}
            tokenId={parseInt(tokenId)}
            state={state}
            dispatch={dispatch}
          />
        )}
      </Route>
    </>
  );
}
