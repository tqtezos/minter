import React, { FC } from 'react';
import { Switch, Route } from 'wouter';

import './App.css';
import SplashPage from '../SplashPage';
import CreateNonFungiblePage from '../CreateNonFungiblePage';

const App: FC = () => (
  <Switch>
    <Route path="/"><SplashPage /></Route>
    <Route path="/create-non-fungible"><CreateNonFungiblePage /></Route>
  </Switch>
  
);

export default App;
