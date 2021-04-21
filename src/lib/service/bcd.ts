import axios, { AxiosResponse } from 'axios';
import { Config } from '../system';

export async function getBigMapKeys(
  config: Config,
  id: number
) {
  let response : AxiosResponse;
  let result = [];
  let offset = 0;
  const uri = `${config.bcd.api}/v1/bigmap/${config.network}/${id}/keys`;
  do {
    response = await axios.get(uri, {
      params: {
        offset
      }
    });
    result.push(...response.data);
    offset += 10;
  } while (response.data.length === 10);
  return result;
}

export async function getContract(config: Config, address: string) {
  const uri = `${config.bcd.api}/v1/contract/${config.network}/${address}`;
  const response = await axios.get(uri);
  return response.data;
}

export async function getContractStorage(config: Config, address: string) {
  const uri = `${config.bcd.api}/v1/contract/${config.network}/${address}/storage`;
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

export async function getWalletContracts(config: Config, address: string) {
  const uri = `${config.bcd.api}/v1/search?q=${address}&i=contract&n=${config.network}&g=0&s=0`;
  const response = await axios.get(uri);
  return response.data;
}

export async function getAccountMetadata(config: Config, address: string) {
  const uri = `${config.bcd.api}/v1/account/${config.network}/${address}/metadata`;
  const response = await axios.get(uri);
  return response.data;
}

export class BetterCallDev {
  config: Config;

  constructor(config: Config) {
    this.config = config;
  }

  getBigMapKeys(id: number) {
    return getBigMapKeys(this.config, id);
  }

  getContract(address: string) {
    return getContract(this.config, address);
  }

  getContractStorage(address: string) {
    return getContractStorage(this.config, address);
  }

  getContractOperations(address: string, since?: Date) {
    return getContractOperations(this.config, address, since);
  }

  getWalletContracts(address: string) {
    return getWalletContracts(this.config, address);
  }

  getAccountMetadata(address: string) {
    return getAccountMetadata(this.config, address);
  }
}
