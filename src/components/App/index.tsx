import React, { useEffect } from 'react';
import { Switch, Route } from 'wouter';
import SplashPage from '../SplashPage';
import CreateNonFungiblePage from '../CreateNonFungiblePage';
import CollectionsCatalog from '../Collections/Catalog';
import CollectionsTokenDetail from '../Collections/TokenDetail';
import MarketplaceCatalog from '../Marketplace/Catalog';
import Header from '../common/Header';
import { Flex } from '@chakra-ui/react';
import Notifications from '../common/Notifications';
import { useSelector, useDispatch } from '../../reducer';
import { reconnectWallet } from '../../reducer/async/wallet';

export default function App() {
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
