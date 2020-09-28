import React, { FC } from 'react';
import { Switch, Route, useLocation } from 'wouter';
import { Fade as Reveal} from "react-awesome-reveal";

import './App.css';
import TzToolkitProvider from './TzToolkitContext';

import SplashPage from '../SplashPage';
import CreateNonFungiblePage from '../CreateNonFungiblePage';
import AssetsPage from '../AssetsPage';

const App: FC = () => {
  const [location] = useLocation();

  return (
    <TzToolkitProvider>
      <Reveal key={location} duration={1500}>
        <Switch>
          <Route path="/"><SplashPage /></Route>
          <Route path="/create-non-fungible"><CreateNonFungiblePage /></Route>
          <Route path="/assets"><AssetsPage /></Route>
        </Switch>
      </Reveal>
    </TzToolkitProvider>
  );
};

export default App;
