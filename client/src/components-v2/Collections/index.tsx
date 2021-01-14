import React, { useReducer } from 'react';
import { Route } from 'wouter';
import { reducer } from './reducer';
import placeholderState from './placeholderState';
import CollectionsCatalog from '../Collections/Catalog';
import CollectionsTokenDetail from '../Collections/TokenDetail';

export default function Collections() {
  const [state, dispatch] = useReducer(reducer, placeholderState);
  return (
    <>
      <Route path="/assets">
        <CollectionsCatalog state={state} dispatch={dispatch} />
      </Route>
      <Route path="/asset-details/:contractAddress/:tokenId">
        {({ contractAddress, tokenId }) => (
          <CollectionsTokenDetail
            contractAddress={contractAddress}
            tokenId={parseInt(tokenId)}
          />
        )}
      </Route>
    </>
  );
}
