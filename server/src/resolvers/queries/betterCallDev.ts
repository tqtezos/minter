import axios from 'axios';
import { selectObjectByKeys } from '../../util';

export type Address = string;

interface Contract {
  address: Address;
  manager: Address;
  bigmaps: {
    ledger?: number;
    operators?: number;
    token_metadata?: number;
  };
}

export interface BigMapItem<T> {
  key: string;
  value: T;
}

function gatherBigMapChildren(children: any) {
  return children.reduce((acc: any, v: any) => {
    const value =
      v.value !== undefined ? v.value : gatherBigMapChildren(v.children);
    return { ...acc, [v.name]: value };
  }, {});
}

export const BigMap = <T>(baseUrl: string, network: string, id: number) => ({
  async values(): Promise<BigMapItem<T>[]> {
    const resp = await axios.get(`${baseUrl}/v1/bigmap/${network}/${id}/keys`);
    return resp.data.map((i: any) => {
      const { value, children } = i.data.value;
      return {
        key: i.data.key_string,
        value: value !== undefined ? value : gatherBigMapChildren(children)
      };
    });
  }
});

function selectBigMap(storage: any, name: string) {
  return selectObjectByKeys(storage, { type: 'big_map', name });
}

export async function contractByAddress(
  baseUrl: string,
  network: string,
  address: string
): Promise<Contract> {
  const contractUrl = `${baseUrl}/v1/contract/${network}/${address}`;
  const contract = (await axios.get(contractUrl)).data;
  const storage = (await axios.get(`${contractUrl}/storage`)).data;

  return {
    address,
    manager: contract.manager,
    bigmaps: {
      ledger: selectBigMap(storage, 'ledger')?.value,
      operators: selectBigMap(storage, 'operators')?.value,
      token_metadata: selectBigMap(storage, 'token_metadata')?.value
    }
  };
}

export const mkBetterCallDev = (baseUrl: string, network: string) => ({
  contractByAddress(address: string): Promise<Contract> {
    return contractByAddress(baseUrl, network, address);
  },

  bigMapById<T>(id: number) {
    return BigMap<T>(baseUrl, network, id);
  }
});

export type BetterCallDev = ReturnType<typeof mkBetterCallDev>;
