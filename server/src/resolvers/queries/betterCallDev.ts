import axios from 'axios';

type Address = string;

interface Contract {
  address: Address;
  manager: Address;
  bigmap_ids: number[];
}

export interface BigMapItem<T> {
  key: string;
  value: T;
}

export const BigMap = <T>(baseUrl: string, network: string, id: number) => ({
  async values(): Promise<BigMapItem<T>[]> {
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

export async function contractByAddress(
  baseUrl: string,
  network: string,
  address: string
): Promise<Contract> {
  const contractUrl = `${baseUrl}/v1/contract/${network}/${address}`;
  const { manager } = (await axios.get(contractUrl)).data;
  const { children } = (await axios.get(`${contractUrl}/storage`)).data;

  return {
    address,
    manager,
    bigmap_ids: children
      ? children
          .filter((v: any) => v.type === 'big_map')
          .map((v: any) => v.value)
      : []
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
