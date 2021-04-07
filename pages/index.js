import React, { useEffect } from 'react';
import { Switch, Route } from 'wouter';
import SplashPage from '../src/components/SplashPage';
import CreateNonFungiblePage from '../src/components/CreateNonFungiblePage';
import CollectionsCatalog from '../src/components/Collections/Catalog';
import CollectionsTokenDetail from '../src/components/Collections/TokenDetail';
import MarketplaceCatalog from '../src/components/Marketplace/Catalog';
import Header from '../src/components/common/Header';
import { Flex } from '@chakra-ui/react';
import Notifications from '../src/components/common/Notifications';
import { Provider, useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { reconnectWallet } from '../src/reducer/async/wallet';
import { store } from '../src/reducer';

function Home() {
  const dispatch = useDispatch();
  const walletReconnectAttempted = useSelector(
    s => s.system.walletReconnectAttempted
  );

  useEffect(() => {
    if (!walletReconnectAttempted) {
      dispatch(reconnectWallet());
    }
  }, [walletReconnectAttempted, dispatch]);

  if (!walletReconnectAttempted) {
    return null;
  }
  return (
    <Flex pos="absolute" w="100%" h="100%">
      <Flex justifyContent="space-between" width="100%" flexDir="column">
        <Header />
        <Switch>
          <Route path="/">
            <SplashPage />
          </Route>
          <Route path="/create">
            <CreateNonFungiblePage />
          </Route>
          <Route path="/collections">
            <CollectionsCatalog />
          </Route>
          <Route path="/marketplace">
            <MarketplaceCatalog />
          </Route>
          <Route path="/collection/:contractAddress/token/:tokenId">
            {({ contractAddress, tokenId }) => (
              <CollectionsTokenDetail
                contractAddress={contractAddress}
                tokenId={parseInt(tokenId)}
              />
            )}
          </Route>
        </Switch>
        <Notifications />
      </Flex>
    </Flex>
  );
}

export default function HomeWrapper() {

  return (
    <Provider store={store}>
      <Home />
    </Provider>
  )
}