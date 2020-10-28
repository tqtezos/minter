import { gql, useQuery } from '@apollo/client';
import {
  Query,
  QueryContractNamesArgs
} from '../../generated/graphql_schema';

const CONTRACTS = gql`
  query contractNames($ownerAddress: String) {
    contractNames(ownerAddress: $ownerAddress) {
      address
      name
    }
  }
`;

export const useContractNamesQuery = (ownerAddress?: string) => {
  return useQuery<Query, QueryContractNamesArgs>(CONTRACTS, {
    variables: { ownerAddress: ownerAddress },
    fetchPolicy: 'network-only'
  });
};
