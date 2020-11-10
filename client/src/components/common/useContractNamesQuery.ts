import { gql, useQuery } from '@apollo/client';
import { Query, QueryContractNamesArgs } from '../../generated/graphql_schema';

const CONTRACTS = gql`
  query contractNames($contractOwnerAddress: String, $nftOwnerAddress: String) {
    contractNamesBcd(
      contractOwnerAddress: $contractOwnerAddress
      nftOwnerAddress: $nftOwnerAddress
    ) {
      address
      name
    }
  }
`;

export const useContractNamesQuery = (
  contractOwnerAddress?: string,
  nftOwnerAddress?: string
) => {
  return useQuery<Query, QueryContractNamesArgs>(CONTRACTS, {
    variables: { contractOwnerAddress, nftOwnerAddress },
    fetchPolicy: 'network-only'
  });
};
