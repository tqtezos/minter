import axios from 'axios';

export type Address = string;

interface Contract {
  address: Address;
  manager: Address;
  bigmap_ids: [number];
}

export interface BigMapItem<T> {
  key: string;
  value: T;
}

export const BigMap = <T>(url: string) => ({
  async values() {
    return axios.get(`${url}/values`).then(r => r.data as BigMapItem<T>[]);
  }
});

export const TzStats = (url: string) => ({
  async contractByAddress(address: Address): Promise<Contract> {
    return axios.get(`${url}/contract/${address}`).then(r => r.data);
  },

  async bigMapById<T>(id: number) {
    return BigMap<T>(`${url}/bigmap/${id}`);
  }
});
