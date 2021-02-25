import React, { useEffect, useState } from 'react';
import { Switch, Route } from 'wouter';
import SplashPage from '../SplashPage';
import CreateNonFungiblePage from '../CreateNonFungiblePage';
import CollectionsCatalog from '../Collections/Catalog';
import CollectionsTokenDetail from '../Collections/TokenDetail';
import Header from '../common/Header';
import { Flex } from '@chakra-ui/react';
import Notifications from '../common/Notifications';
import { useDispatch } from '../../reducer';
import { reconnectWallet } from '../../reducer/async/wallet';

export default function App() {
  const [reconnectAttempted, setReconnectAttempted] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (reconnectAttempted) return;
    (async () => {
      await dispatch(reconnectWallet());
      setReconnectAttempted(true);
    })();
  }, [reconnectAttempted, dispatch]);

  if (!reconnectAttempted) {
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
