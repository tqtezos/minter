import React, { useEffect } from 'react';
import { Switch, Route } from 'wouter';
import CreateNonFungiblePage from '../CreateNonFungiblePage';
import CollectionsCatalog from '../Collections/Catalog';
import CollectionDisplay from '../Collections/Catalog/CollectionDisplay';
import CollectionsTokenDetail from '../Collections/TokenDetail';
import MarketplaceCatalog from '../Marketplace/Catalog';
import Header from '../common/Header';
import { Flex } from '@chakra-ui/react';
import Notifications from '../common/Notifications';
import { useSelector, useDispatch } from '../../reducer';
import { reconnectWallet } from '../../reducer/async/wallet';
import Creator from '../Creator';
// import { getMarketplaceNftsQuery } from '../../reducer/async/queries';

export default function App() {
  const dispatch = useDispatch();
  const state = useSelector(s => s);

  let walletReconnectAttempted = state.system.walletReconnectAttempted;

  // // This causes excessive resource consumption as *all* marketplace data
  // // loads when the app is mounted, even if the user has not landed or will
  // // not land on the `/marketplace` view
  //
  // useEffect(() => {
  //   dispatch(getMarketplaceNftsQuery(state.marketplace.marketplace.address));
  // }, [state.marketplace.marketplace.address, dispatch]);

  useEffect(() => {
    if (!walletReconnectAttempted) {
      dispatch(reconnectWallet());
    }
  }, [walletReconnectAttempted, dispatch]);

  return (
    <Flex pos="absolute" w="100%" h="100%">
      <Flex justifyContent="space-between" width="100%" flexDir="column">
        <Header />
        <Switch>
          <Route path="/">
            <MarketplaceCatalog />
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
          <Route path="/creator/:minter">
            {({ minter }) => <Creator minter={minter} />}
          </Route>
          <Route path="/collection/:contractAddress">
            {({ contractAddress }) => (
              <CollectionDisplay address={contractAddress} ownedOnly={false} />
            )}
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
