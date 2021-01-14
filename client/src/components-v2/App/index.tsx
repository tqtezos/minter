import React from 'react';
import { Switch, Route } from 'wouter';
import SplashPage from '../SplashPage';
import CreateNonFungiblePage from '../CreateNonFungiblePage';
import AssetsPage from '../AssetsPage';
import AssetDetailsPage from '../AssetDetailsPage';
import { Header } from '../common';
import { Flex } from '@chakra-ui/react';

export default function App() {
  return (
    <Flex pos="absolute" w="100%" h="100%">
      <Flex justifyContent="space-between" width="100%" flexDir="column">
        <Header />
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
      </Flex>
    </Flex>
  );
}
