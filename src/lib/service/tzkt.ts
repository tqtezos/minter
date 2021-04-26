import axios from 'axios';
import { Config } from '../system';

export type Params = Record<string, string>;

function mkQueryParams(params: Params | undefined) {
  const finalParams = { limit: '10000', ...params };
  return new URLSearchParams(finalParams).toString();
}

export async function getBigMapKeys(
  config: Config,
  id: number,
  params?: Params
) {
  const uri = `${config.tzkt.api}/v1/bigmaps/${id}/keys?${mkQueryParams(
    params
  )}`;
  const response = await axios.get(uri);
  return response.data;
}

export async function getBigMapUpdates(config: Config, params?: Params) {
  const uri = `${config.tzkt.api}/v1/bigmaps/updates?${mkQueryParams(params)}`;
  const response = await axios.get(uri);
  return response.data;
}

export async function getContracts(config: Config, params?: Params) {
  const uri = `${config.tzkt.api}/v1/contracts?${mkQueryParams(params)}`;
  const response = await axios.get(uri);
  return response.data;
}

export async function getContract(
  config: Config,
  address: string,
  params?: Params
) {
  const uri = `${config.tzkt.api}/v1/contracts/${address}?${mkQueryParams(
    params
  )}`;
  const response = await axios.get(uri);
  return response.data;
}

export async function getContractBigMapKeys(
  config: Config,
  address: string,
  name: string,
  params?: Params
) {
  const uri = `${
    config.tzkt.api
  }/v1/contracts/${address}/bigmaps/${name}/keys?${mkQueryParams(params)}`;
  const response = await axios.get(uri);
  return response.data;
}

export async function getContractStorage(
  config: Config,
  address: string,
  params?: Params
) {
  const uri = `${
    config.tzkt.api
  }/v1/contracts/${address}/storage?${mkQueryParams(params)}`;
  const response = await axios.get(uri);
  return response.data;
}

export class TzKt {
  config: Config;

  constructor(config: Config) {
    this.config = config;
  }

  getBigMapKeys(id: number, params?: Params) {
    return getBigMapKeys(this.config, id, params);
  }

  getBigMapUpdates(params?: Params) {
    return getBigMapUpdates(this.config, params);
  }

  getContracts(params?: Params) {
    return getContracts(this.config, params);
  }

  getContract(address: string, params?: Params) {
    return getContract(this.config, address, params);
  }

  getContractBigMapKeys(address: string, name: string, params?: Params) {
    return getContractBigMapKeys(this.config, address, name, params);
  }

  getContractStorage(address: string, params?: Params) {
    return getContractStorage(this.config, address, params);
  }
}
