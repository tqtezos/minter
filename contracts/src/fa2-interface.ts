import { $log } from '@tsed/logger';
import { TezosToolkit, MichelsonMap } from '@taquito/taquito';
import { address, nat } from './type-aliases';

export interface Fa2TransferDestination {
  to_: address;
  token_id: nat;
  amount: nat;
}

export interface Fa2Transfer {
  from_: address;
  txs: Fa2TransferDestination[];
}

export interface BalanceOfRequest {
  owner: address;
  token_id: nat;
}

export interface BalanceOfResponse {
  balance: nat;
  request: BalanceOfRequest;
}

export interface TokenMetadata {
  token_id: nat;
  symbol: string;
  name: string;
  decimals: nat;
  extras: MichelsonMap<string, string>;
}

export async function transfer(
  fa2: address,
  operator: TezosToolkit,
  txs: Fa2Transfer[]
): Promise<void> {
  $log.info('transferring');
  const nftWithOperator = await operator.contract.at(fa2);

  const op = await nftWithOperator.methods.transfer(txs).send();

  const hash = await op.confirmation(3);
  $log.info(`consumed gas: ${op.consumedGas}`);
}

export async function addOperator(
  fa2: address,
  owner: TezosToolkit,
  operator: address,
  token_id: nat
): Promise<void> {
  $log.info('adding operator');
  const fa2WithOwner = await owner.contract.at(fa2);
  const ownerAddress = await owner.signer.publicKeyHash();
  const op = await fa2WithOwner.methods
    .update_operators([
      {
        add_operator: {
          owner: ownerAddress,
          operator,
          token_id
        }
      }
    ])
    .send();
  await op.confirmation(3);
  $log.info(`consumed gas: ${op.consumedGas}`);
}

export async function removeOperator(
  fa2: address,
  owner: TezosToolkit,
  operator: address,
  token_id: nat
): Promise<void> {
  $log.info('removing operator');
  const fa2WithOwner = await owner.contract.at(fa2);
  const ownerAddress = await owner.signer.publicKeyHash();
  const op = await fa2WithOwner.methods
    .update_operators([
      {
        remove_operator: {
          owner: ownerAddress,
          operator,
          token_id
        }
      }
    ])
    .send();
  await op.confirmation(3);
  $log.info(`consumed gas: ${op.consumedGas}`);
}
