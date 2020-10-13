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

function deepFind<TValue>(
  o: { [key: string]: any },
  propertyName: string
): TValue | undefined {
  if (!o || typeof o !== 'object') return undefined;
  if (o.hasOwnProperty(propertyName)) return o[propertyName] as TValue;

  for (const key in o) {
    const v = deepFind<TValue>(o[key], propertyName);
    if (v) return v;
  }

  return undefined;
}
