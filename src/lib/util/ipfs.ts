import axios from 'axios';

export interface IpfsContent {
  cid: string;
  size: number;
  ipfsUri: string;
  url: string;
  publicGatewayUrl: string;
}

export interface IpfsResponse extends IpfsContent {
  thumbnail: IpfsContent;
}

export async function uploadIPFSJSON(api: string, data: any) {
  return axios.post<IpfsResponse>(`${api}/ipfs-json-upload`, data);
}

export async function uploadIPFSFile(api: string, file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return axios.post<IpfsResponse>(`${api}/ipfs-file-upload`, formData);
}

export async function uploadIPFSImageWithThumbnail(api: string, file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return axios.post<IpfsResponse>(
    `${api}/ipfs-image-with-thumbnail-upload`,
    formData
  );
}

// URI Utils

export function isIpfsUri(uri: string) {
  return /^ipfs:\/\/.+/.test(uri);
}

export function ipfsUriToCid(uri: string) {
  const baseRegex = /^ipfs:\/\//;
  const ipfsRegex = new RegExp(baseRegex.source + '.+');
  if (ipfsRegex.test(uri)) {
    return uri.replace(baseRegex, '');
  }
  return null;
}

export type IpfsGatewayConfig = { ipfsGateway: string };
export function ipfsUriToGatewayUrl(config: IpfsGatewayConfig, uri: string) {
  const cid = ipfsUriToCid(uri);
  return cid ? `${config.ipfsGateway}/ipfs/${cid}` : uri;
}

export function uriToCid(uri: string) {
  const ipfsUriCid = ipfsUriToCid(uri);
  if (ipfsUriCid) {
    return ipfsUriCid;
  }
  const baseRegex = /^https:\/\/.*\/ipfs\//;
  const httpRegex = new RegExp(baseRegex.source + '.+');
  if (httpRegex.test(uri)) {
    return uri.replace(baseRegex, '');
  }
  return null;
}
