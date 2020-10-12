import { BigNumber } from 'bignumber.js';
import { WalletContract } from '@taquito/taquito/dist/types/contract';

export type Contract = WalletContract;

export type Address = string;
export type Nat = BigNumber;

export async function retrieveStorageField<TValue>(
  contract: Contract,
  fieldName: string
): Promise<TValue> {
  const storage = await contract.storage<any>();
  const value = deepFind<TValue>(storage, fieldName);
  if (value === undefined)
    throw new Error(`storage field ${fieldName} not found`);
  return value;
}

function deepFind<TValue>(o: any, propertyName: string): TValue | undefined {
  if (o.hasOwnProperty(propertyName)) return o[propertyName] as TValue;

  const nested = Object.values(o).filter(v => typeof v === 'object');
  for (var n in nested) {
    const v = deepFind<TValue>(n, propertyName);
    if (v !== undefined) return v;
  }
  return undefined;
}
