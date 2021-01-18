import axios from 'axios';
import { Config } from '../system';

export async function getBigMap(config: Config, id: number) {
  const uri = `${config.bcd.api}/v1/bigmap/${config.network}/${id}/keys`;
  const response = await axios.get(uri);
  return response.data;
}

export async function getContract(config: Config, address: string) {
  const uri = `${config.bcd.api}/v1/contract/${config.network}/${address}`;
  const response = await axios.get(uri);
  return response.data;
}

export async function getContractOperations(
  config: Config,
  address: string,
  since?: Date
) {
  const from = since ? `?from=${since.getTime()}` : '';
  const uri = `${config.bcd.api}/v1/contract/${config.network}/${address}/operations${from}`;
  const response = await axios.get(uri);
  return response.data;
}

export class BetterCallDev {
  config: Config;

  constructor(config: Config) {
    this.config = config;
  }

  getBigMap(id: number) {
    return getBigMap(this.config, id);
  }

  getContract(address: string) {
    return getContract(this.config, address);
  }

  getContractOperations(address: string, since?: Date) {
    return getContractOperations(this.config, address, since);
  }
}
