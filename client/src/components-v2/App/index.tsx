import React from 'react';
import { Switch, Route } from 'wouter';
import SplashPage from '../SplashPage';
import CreateNonFungiblePage from '../CreateNonFungiblePage';
import AssetsPage from '../AssetsPage';

export default function App() {
  return (
    <Switch>
      <Route path="/">
        <SplashPage />
      </Route>
      <Route path="/create-non-fungible">
        <CreateNonFungiblePage />
      </Route>
      <Route path="/assets">
        <AssetsPage />
      </Route>
      {/* <Route path="/asset-details/:contractAddress/:tokenId"> */}
      {/*   {({ contractAddress, tokenId }) => ( */}
      {/*     <AssetDetailsPage */}
      {/*       contractAddress={contractAddress} */}
      {/*       tokenId={parseInt(tokenId)} */}
      {/*     /> */}
      {/*   )} */}
      {/* </Route> */}
    </Switch>
  );
}
