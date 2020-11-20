import { gql, ApolloClient } from '@apollo/client';
import {
  Query,
  QueryContractOperationStatusArgs,
  OperationStatus
} from '../generated/graphql_schema';
import { pollUntilTrue } from './polling';

const CONTRACT_OPERATION_STATUS = gql`
  query contractOperationStatus($contractAddress: String!, $hash: String!) {
    contractOperationStatus(contractAddress: $contractAddress, hash: $hash) {
      status
      timestamp
      error
    }
  }
`;

export const contractOperationStatus = async (
  client: ApolloClient<object>,
  contractAddress: string,
  hash: string
): Promise<OperationStatus | undefined> => {
  console.log(
    `Checking for status of contract ${contractAddress} operation ${hash}`
  );

  const r = await client.query<Query, QueryContractOperationStatusArgs>({
    query: CONTRACT_OPERATION_STATUS,
    variables: { contractAddress, hash },
    fetchPolicy: 'network-only'
  });

  console.log(`The status is ${JSON.stringify(r.data?.contractOperationStatus)}`);
  return r.data?.contractOperationStatus === null ? undefined: r.data?.contractOperationStatus
};

export const waitForConfirmation = (
  client: ApolloClient<object>,
  contractAddress: string,
  hash: string
): Promise<void> => {
  return pollUntilTrue(
    () => contractOperationStatus(client, contractAddress, hash).then(r => r !== undefined),
    3000, // 3 seconds
    5 * 60 * 1000 // 5 minutes
  );
};
