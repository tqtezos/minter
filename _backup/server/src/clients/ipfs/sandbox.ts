import IpfsHttpClient from 'ipfs-http-client';
import url from 'url';
import { Readable } from 'stream';
import { IpfsClient, IpfsClientUploadResult } from '.';

export interface SandboxConfig {
  apiBaseUrl?: string;
  gatewayUrl?: string;
}

export class SandboxIpfsClient implements IpfsClient {

  private config: SandboxConfig;

  constructor(config: SandboxConfig) {
    this.config = config;
    if (this.config.apiBaseUrl === undefined) {
      this.config.apiBaseUrl = "http://ipfs:5001";
    }
    if (this.config.gatewayUrl === undefined) {
      this.config.gatewayUrl = "http://127.0.0.1:8080";
    }
  }

  public async uploadFile(data: Readable): Promise<IpfsClientUploadResult> {
    if (this.config.gatewayUrl === undefined) {
      throw new TypeError("Expected gatewayUrl to be defined by now");
    }

    const ipfsClient = IpfsHttpClient(this.config.apiBaseUrl);
    const ipfsFile = await ipfsClient.add(data);
    const cid = ipfsFile.cid.toString();

    return {
      cid: cid,
      size: ipfsFile.size,
      url: url.resolve(this.config.gatewayUrl, `/ipfs/${cid}`)
    };
  }

  public async uploadJSON(data: any): Promise<IpfsClientUploadResult> {
    return this.uploadFile(Readable.from(JSON.stringify(data)));
  }

}
