import { gql, useQuery } from '@apollo/client';
import { NonFungibleToken } from '../../generated/graphql_schema';

const NON_FUNGIBLE_TOKENS = gql`
  query NonFungibleTokens {
    nfts {
      token_id
      symbol
      name
      owner
      extras
    }
  }
`;

interface Data {
  nfts: NonFungibleToken[]
}

export default () => useQuery<Data, void>(
  NON_FUNGIBLE_TOKENS,
  
  // For some reason Apollo client seems to read it from cache
  // without 'network-only' option
  { fetchPolicy: 'network-only' }
);
