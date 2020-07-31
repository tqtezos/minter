import { BigNumber } from 'bignumber.js';
import { ContractAbstraction } from '@taquito/taquito/dist/types/contract';
import { ContractProvider } from '@taquito/taquito/dist/types/contract/interface';

export type Contract = ContractAbstraction<ContractProvider>;

export type address = string;
export type nat = BigNumber;
