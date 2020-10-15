import { gql, useQuery } from '@apollo/client';
import {
  Query,
  QueryContractNamesByOwnerArgs
} from '../../generated/graphql_schema';
import { useWalletAddress } from '../App/globalContext';

const CONTRACTS = gql`
  query contractNamesByOwner($owner_address: String) {
    contractNamesByOwner(owner_address: $owner_address) {
      address
      name
    }
  }
`;

export const useContractNamesQuery = () => {
  const address = useWalletAddress();

  return useQuery<Query, QueryContractNamesByOwnerArgs>(CONTRACTS, {
    variables: { owner_address: address },
    fetchPolicy: 'network-only'
  });
};
