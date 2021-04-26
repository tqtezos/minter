declare module 'ipfs-http-client' {
  export type FileContent = any | Blob | string;

  export interface Cid {
    toString: () => string;
  }

  export interface IpfsFile {
    path: string;
    cid: Cid;
    size: number;
  }

  export interface IpfsClientApi {
    add: (data: FileContent) => Promise<IpfsFile>;
  }

  export default function (any): IpfsClientApi;
}
