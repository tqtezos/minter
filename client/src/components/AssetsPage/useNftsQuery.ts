import { gql, useQuery } from '@apollo/client';
import { Query, QueryNftsArgs } from '../../generated/graphql_schema';
import { useWalletAddress } from '../App/globalContext';

const NFTS = gql`
  query Nfts($ownerAddress: String, $contractAddress: String) {
    nfts(ownerAddress: $ownerAddress, contractAddress: $contractAddress) {
      token_id
      symbol
      name
      owner
      extras
    }
  }
`;

export const useNftsQuery = (contractAddress?: string) => {
  const ownerAddress = useWalletAddress();

  return useQuery<Query, QueryNftsArgs>(NFTS, {
    variables: { ownerAddress, contractAddress },
    fetchPolicy: 'network-only'
  });
};
