import axios from 'axios';

export type Address = string;

interface Contract {
  address: Address;
  manager: Address;
  bigmap_ids: number[];
}

export interface BigMapItem<K, V> {
  key: K;
  value: V;
}

export const BigMap = <K, V>(baseUrl: string, network: string, id: number) => ({
  async values(): Promise<BigMapItem<K, V>[]> {
    const resp = await axios.get(`${baseUrl}/v1/bigmap/${network}/${id}/keys`);
    return resp.data.map((i: any) => ({
      key: i.data.key_string,
      value: i.data.value.value
        ? i.data.value.value
        : i.data.value.children.reduce((acc: any, v: any) => {
            return {
              ...acc,
              [v.name]: v.value
                ? v.value
                : v.children.reduce((acc: any, v2: any) => {
                    return { ...acc, [v2.name]: v2.value };
                  }, {})
            };
          }, {})
    }));
  }
});

function extractBigMapIds(storage: any): number[] {
  if (storage.type === 'big_map') {
    return [storage.value];
  }
  if (storage.children && storage.children[1]?.type === 'namedtuple') {
    return storage.children[1].children
      .filter((v: any) => v.type === 'big_map')
      .map((v: any) => v.value);
  }
  if (storage.children) {
    return storage.children
      .filter((v: any) => v.type === 'big_map')
      .map((v: any) => v.value);
  }
  return [];
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
    bigmap_ids: extractBigMapIds(storage)
  };
}

export const mkBetterCallDev = (baseUrl: string, network: string) => ({
  contractByAddress(address: string): Promise<Contract> {
    return contractByAddress(baseUrl, network, address);
  },

  bigMapById<K, V>(id: number) {
    return BigMap<K, V>(baseUrl, network, id);
  }
});

export type BetterCallDev = ReturnType<typeof mkBetterCallDev>;
