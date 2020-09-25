import { TezosToolkit } from '@taquito/taquito';
import { TransactionOperation } from '@taquito/taquito/dist/types/operations/transaction-operation';
import {
  OperationContentsAndResultTransaction,
  OperationResultTransaction
} from '@taquito/rpc';
import { address } from './contractUtil';

export interface NftFactoryContract {
  createNftContract(): Promise<string>;
}

const mkNftFactoryContract = async (
  tzClient: TezosToolkit,
  factoryAddress: address
): Promise<NftFactoryContract> => {
  return {
    async createNftContract(): Promise<address> {
      const operation = await tzClient.contract.transfer({
        amount: 0,
        to: factoryAddress
      });
      await operation.confirmation();
      return extractOriginatedContractAddress(operation);
    }
  };
};

function extractOriginatedContractAddress(op: TransactionOperation): address {
  const result = op.results[0];
  const txResult = result as OperationContentsAndResultTransaction;
  if (!txResult.metadata.internal_operation_results)
    throw new Error('Unavailable internal origination operation');
  const internalResult = txResult.metadata.internal_operation_results[0]
    .result as OperationResultTransaction;
  if (!internalResult.originated_contracts)
    throw new Error('Originated contract address is unavailable');

  return internalResult.originated_contracts[0];
}

export default mkNftFactoryContract;
