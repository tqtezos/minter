import { gql, useQuery } from '@apollo/client';
import { Query } from '../../generated/graphql_schema';

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

export default () => useQuery<Query, void>(
  NON_FUNGIBLE_TOKENS, 
  { fetchPolicy: 'network-only' }
);
