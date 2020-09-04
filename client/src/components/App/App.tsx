import React, { FC } from 'react';
import { Switch, Route, useLocation } from 'wouter';
import { Fade as Reveal} from "react-awesome-reveal";

import './App.css';
import SplashPage from '../SplashPage';
import CreateNonFungiblePage from '../CreateNonFungiblePage';

const App: FC = () => {
  const [location] = useLocation();

  return (
    <Reveal key={location} duration={1500}>
      <Switch>
        <Route path="/"><SplashPage /></Route>
        <Route path="/create-non-fungible"><CreateNonFungiblePage /></Route>
      </Switch>
    </Reveal>
  );
};

export default App;
