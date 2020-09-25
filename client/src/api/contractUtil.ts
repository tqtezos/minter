import { BigNumber } from 'bignumber.js';
import { ContractAbstraction } from '@taquito/taquito/dist/types/contract';
import { ContractProvider } from '@taquito/taquito/dist/types/contract/interface';
import { valueFromAST } from 'graphql';

export type Contract = ContractAbstraction<ContractProvider>;

export type address = string;
export type nat = BigNumber;

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
  const deepFindImpl = (o: any) => {
    if (o.hasOwnProperty(propertyName)) return o[propertyName];

    const nested = Object.values(o).filter(v => typeof v === 'object');
    for (var n in nested) {
      const v: any = deepFindImpl(n);
      if (v !== undefined) return v;
    }
    return undefined;
  };

  const val = deepFindImpl(o);
  if (val === undefined) return undefined;
  return val as TValue;
}
