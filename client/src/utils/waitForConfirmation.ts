import { TransactionWalletOperation } from '@taquito/taquito';
import { OperationStatus } from '../generated/graphql_schema';
import { pollUntilTrue, sleep } from './polling';
import { contractOperationStatus } from '../resolvers/contractOperationStatus';
import { indexerStats } from '../resolvers/indexerStats';
import config from '../config';

export const getContractOperationStatus = async (
  contractAddress: string,
  hash: string,
  since?: string
): Promise<OperationStatus | undefined> => {
  console.log(
    `Checking for status of contract ${contractAddress} operation ${hash}`
  );

  const opStatus = await contractOperationStatus(
    contractAddress,
    hash,
    since,
    config.bcdApiUrl,
    config.bcdNetwork
  );

  console.log(`The status is ${JSON.stringify(opStatus)}`);

  if (opStatus === null) return undefined;

  // BCD is not accurate and sometimes even after returning status applied the data is not ready
  // Wait for 1 second to make sure the data is ready
  await sleep(1000);
  return opStatus;
};

export const waitForConfirmation = async (
  contractAddress: string,
  op: () => Promise<TransactionWalletOperation>
): Promise<TransactionWalletOperation> => {
  const stats = await indexerStats(config.bcdApiUrl, config.bcdNetwork);
  const operation = await op();

  await pollUntilTrue(
    () =>
      getContractOperationStatus(
        contractAddress,
        operation.opHash,
        stats.timestamp
      ).then(r => r !== undefined),
    3000, // 3 seconds
    5 * 60 * 1000 // 5 minutes
  );

  return operation;
};
