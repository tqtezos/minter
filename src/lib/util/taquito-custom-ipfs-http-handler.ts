import { Handler, Tzip16Uri } from '@taquito/tzip16';
import { HttpBackend } from '@taquito/http-utils';
import {
  ContractAbstraction,
  ContractProvider,
  Wallet,
  Context
} from '@taquito/taquito';

export default class CustomIpfsHttpHandler implements Handler {
  private _ipfsGateway: string;
  private _gatewayProtocol: string;
  private _httpBackend = new HttpBackend();

  constructor(ipfsGatheway?: string, gatewayProtocol?: string) {
    this._ipfsGateway = ipfsGatheway ? ipfsGatheway : 'ipfs.io';
    this._gatewayProtocol = gatewayProtocol ? gatewayProtocol : 'https';
  }

  async getMetadata(
    _contractAbstraction: ContractAbstraction<ContractProvider | Wallet>,
    { location }: Tzip16Uri,
    _context: Context
  ): Promise<string> {
    return this._httpBackend.createRequest<string>({
      url: `${this._gatewayProtocol}://${
        this._ipfsGateway
      }/ipfs/${location.substring(2)}/`,
      method: 'GET',
      headers: { 'Content-Type': 'text/plain' },
      mimeType: 'text; charset=utf-8',
      json: false
    });
  }
}
