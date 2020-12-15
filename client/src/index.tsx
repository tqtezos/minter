import React from 'react';
import ReactDOM from 'react-dom';
import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  split,
  createHttpLink
} from '@apollo/client';
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';
import introspectionResult from './generated/fragmentTypes.json';

import './index.css';
import App from './components/App';
import * as serviceWorker from './serviceWorker';

const httpLink = createHttpLink({ uri: '/graphql' });

const wsLink = new WebSocketLink({
  uri: window.location.origin.replace(/^http(s?:\/\/.*)$/, 'ws$1/graphql'),
  options: {
    reconnect: true
  }
});

const link = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink
);

const cache = new InMemoryCache({
  possibleTypes: introspectionResult.possibleTypes
});

const client = new ApolloClient({
  link,
  cache,
  resolvers: {}
});

ReactDOM.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
