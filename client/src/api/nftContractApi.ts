import { TezosToolkit } from '@taquito/taquito';
import { TransactionWalletOperation } from '@taquito/taquito';
import {
  OperationContentsAndResultTransaction,
  OperationResultTransaction
} from '@taquito/rpc';

import { SettingsContracts } from '../generated/graphql_schema';
import { waitForConfirmation } from '../utils/waitForConfirmation';
import { Address } from './contractUtil';
import { NftContract } from './nftContract';
import mkNftContract from './nftContract';
import { ApolloClient } from '@apollo/client';

export interface NftFactoryContract {
  createNftContract(name: string): Promise<string>;
}

async function extractOriginatedContractAddress(
  op: TransactionWalletOperation
): Promise<Address> {
  const txResults = await op.operationResults();
  const txResult = txResults[0] as OperationContentsAndResultTransaction;

  if (!txResult.metadata.internal_operation_results)
    throw new Error('Unavailable internal origination operation');

  const internalResult = txResult.metadata.internal_operation_results[0]
    .result as OperationResultTransaction;

  if (!internalResult.originated_contracts)
    throw new Error('Originated contract address is unavailable');

  return internalResult.originated_contracts[0];
}

export interface NftContractApi {
  faucetContractAddress: Address;
  createContract(name: string): Promise<Address>;
  contractByAddress(address: Address): Promise<NftContract>;
}

const mkContractApi = async (
  client: ApolloClient<object>,
  tzToolkit: TezosToolkit,
  settings: SettingsContracts
): Promise<NftContractApi> => {
  return {
    faucetContractAddress: settings.nftFaucet,

    async createContract(name: string) {
      const factory = await tzToolkit.wallet.at(settings.nftFactory);
      const op = await waitForConfirmation(client, settings.nftFactory, () =>
        factory.methods.default(name).send()
      );

      return extractOriginatedContractAddress(op);
    },

    async contractByAddress(address: Address) {
      const contract = await tzToolkit.wallet.at(address);
      const ownerAddress = await tzToolkit.wallet.pkh();
      return mkNftContract(client, contract, ownerAddress);
    }
  };
};

export default mkContractApi;
