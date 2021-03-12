import { Readable } from 'stream';

export * from './fleek';
export * from './pinata';
export * from './sandbox';

export interface IpfsClientUploadResult {
  cid: string;
  size: number;
  url: string;
}

export interface IpfsClient {
  uploadFile(data: Readable): Promise<IpfsClientUploadResult>;
  uploadJSON(data: any): Promise<IpfsClientUploadResult>;
}
