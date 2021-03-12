import axios from 'axios';
import url from 'url';
import { Readable } from 'stream';
import FormData from 'form-data';
import { IpfsClient, IpfsClientUploadResult } from '.';

export interface PinataConfig {
  apiKey: string;
  apiSecret: string;
  apiBaseUrl?: string;
  gatewayUrl?: string;
}

export class PinataIpfsClient implements IpfsClient {

  private config: PinataConfig;

  constructor(config: PinataConfig) {
    this.config = config;
    if (this.config.apiBaseUrl === undefined) {
      this.config.apiBaseUrl = "https://api.pinata.cloud";
    }
    if (this.config.gatewayUrl === undefined) {
      this.config.gatewayUrl = "https://gateway.pinata.cloud";
    }
  }

  public async uploadFile(data: Readable): Promise<IpfsClientUploadResult> {
    const pinataUrl = `${this.config.apiBaseUrl}/pinning/pinFileToIPFS`;
    const formData = new FormData();
    formData.append('file', data);

    const pinataRes = await axios.post(pinataUrl, formData, {
      maxContentLength: Infinity,
      headers: {
        'Content-Type': `multipart/form-data; boundary=${
          (formData as any)._boundary
        }`,
        pinata_api_key: this.config.apiKey,
        pinata_secret_api_key: this.config.apiSecret
      }
    });

    return this.formatResult(pinataRes);
  }

  public async uploadJSON(data: any): Promise<IpfsClientUploadResult> {
    const pinataUrl = `${this.config.apiBaseUrl}/pinning/pinJSONToIPFS`;
    const pinataRes = await axios.post(pinataUrl, data, {
      headers: {
        pinata_api_key: this.config.apiKey,
        pinata_secret_api_key: this.config.apiSecret
      }
    });

    return this.formatResult(pinataRes);
  }

  private formatResult(res: any): IpfsClientUploadResult {
    if (this.config.gatewayUrl === undefined) {
      throw new TypeError("Expected gatewayUrl to be defined by now");
    }

    const pinataData = res.data;
    const cid = pinataData.IpfsHash;

    return {
      cid: cid,
      size: pinataData.PinSize,
      url: url.resolve(this.config.gatewayUrl, `/ipfs/${cid}`)
    };
  }

}
