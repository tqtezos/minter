import { gql, ApolloClient } from '@apollo/client';
import { Query, QueryNftExistsArgs } from '../generated/graphql_schema';
import { pollUntilTrue } from './polling';

const NFT_EXISTS = gql`
  query nftExists($contractAddress: String!, $tokenId: Int!) {
    nftExists(contractAddress: $contractAddress, tokenId: $tokenId)
  }
`;

export const nftExists = async (
  client: ApolloClient<object>,
  contractAddress: string,
  tokenId: number
): Promise<boolean> => {
  console.log(`Checking if token ${tokenId} exists in Contract ${contractAddress}`);

  const r = await client.query<Query, QueryNftExistsArgs>({
    query: NFT_EXISTS,
    variables: { contractAddress, tokenId },
    fetchPolicy: 'network-only'
  });

  console.log(`The answer is ${r.data!.nftExists}`);

  return r.data!.nftExists;
};

export const waitUntilNftExists = (
  client: ApolloClient<object>,
  contractAddress: string,
  tokenId: number
): Promise<void> => {
  return pollUntilTrue(
    () => nftExists(client, contractAddress, tokenId),
    3000,
    5 * 60 * 1000
  );
};

export const waitUntilNftDoesNotExist = (
  client: ApolloClient<object>,
  contractAddress: string,
  tokenId: number
): Promise<void> => {
  return pollUntilTrue(
    () => nftExists(client, contractAddress, tokenId).then(r => !r),
    3000,
    5 * 60 * 1000
  );
};
