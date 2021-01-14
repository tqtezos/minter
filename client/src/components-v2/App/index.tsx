import React from 'react';
import { Switch, Route } from 'wouter';
import SplashPage from '../SplashPage';
import CreateNonFungiblePage from '../CreateNonFungiblePage';
import Collections from '../Collections';
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
          <Collections />
        </Switch>
      </Flex>
    </Flex>
  );
}
