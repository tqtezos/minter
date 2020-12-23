import React, { FC } from 'react';
import { Switch, Route, useLocation } from 'wouter';
import { Fade as Reveal } from 'react-awesome-reveal';

import './App.css';
import GlobalContextProvider from './globalContext';

import SplashPage from '../SplashPage';
import CreateNonFungiblePage from '../CreateNonFungiblePage';
import AssetsPage from '../AssetsPage';
import AssetDetailsPage from '../AssetDetailsPage';
import { ParametersInvalidBeaconError } from '@airgap/beacon-sdk';

const App: FC = () => {
  const [location] = useLocation();

  return (
    <GlobalContextProvider>
      <Reveal key={location} duration={1500}>
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
          <Route path="/asset-details/:contractAddress/:tokenId">
            {({ contractAddress, tokenId }) => (
              <AssetDetailsPage
                contractAddress={contractAddress}
                tokenId={parseInt(tokenId)}
              />
            )}
          </Route>
        </Switch>
      </Reveal>
    </GlobalContextProvider>
  );
};

export default App;
