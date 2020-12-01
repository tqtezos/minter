import { gql, ApolloClient } from '@apollo/client';
import { TransactionWalletOperation } from '@taquito/taquito';
import {
  Query,
  QueryContractOperationStatusArgs,
  OperationStatus
} from '../generated/graphql_schema';
import { pollUntilTrue, sleep } from './polling';

const INDEXER_STATS = gql`
  query {
    indexerStats {
      protocol
      chainId
      network
      timestamp
      level
    }
  }
`;

export const indexerStats = async (client: ApolloClient<object>) => {
  const r = await client.query<Query>({
    query: INDEXER_STATS,
    fetchPolicy: 'network-only'
  });

  return r.data!.indexerStats;
};

const CONTRACT_OPERATION_STATUS = gql`
  query contractOperationStatus(
    $contractAddress: String!
    $hash: String!
    $since: String
  ) {
    contractOperationStatus(
      contractAddress: $contractAddress
      hash: $hash
      since: $since
    ) {
      status
      timestamp
      error
    }
  }
`;

export const contractOperationStatus = async (
  client: ApolloClient<object>,
  contractAddress: string,
  hash: string,
  since?: string
): Promise<OperationStatus | undefined> => {
  console.log(
    `Checking for status of contract ${contractAddress} operation ${hash}`
  );

  const r = await client.query<Query, QueryContractOperationStatusArgs>({
    query: CONTRACT_OPERATION_STATUS,
    variables: { contractAddress, hash, since },
    fetchPolicy: 'network-only'
  });

  console.log(
    `The status is ${JSON.stringify(r.data?.contractOperationStatus)}`
  );

  if (r.data?.contractOperationStatus === null) return undefined;

  // BCD is not accurate and sometimes even after returning status applied the data is not ready
  // Wait for 1 second to make sure the data is ready
  await sleep(1000);
  return r.data?.contractOperationStatus;
};

export const waitForConfirmation = async (
  client: ApolloClient<object>,
  contractAddress: string,
  op: () => Promise<TransactionWalletOperation>
): Promise<TransactionWalletOperation> => {
  const stats = await indexerStats(client);
  const operation = await op();

  await pollUntilTrue(
    () =>
      contractOperationStatus(
        client,
        contractAddress,
        operation.opHash,
        stats.timestamp
      ).then(r => r !== undefined),
    3000, // 3 seconds
    5 * 60 * 1000 // 5 minutes
  );

  return operation;
};
