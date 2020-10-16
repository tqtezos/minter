import { gql, useQuery } from '@apollo/client';
import {
  Query,
  QueryContractNamesByOwnerArgs
} from '../../generated/graphql_schema';

const CONTRACTS = gql`
  query contractNamesByOwner($owner_address: String) {
    contractNamesByOwner(owner_address: $owner_address) {
      address
      name
    }
  }
`;

export const useContractNamesQuery = (ownerAddress?: string) => {
  return useQuery<Query, QueryContractNamesByOwnerArgs>(CONTRACTS, {
    variables: { owner_address: ownerAddress },
    fetchPolicy: 'network-only'
  });
};
