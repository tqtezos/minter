import axios from 'axios';

export type IpfsContent = {
  cid: string;
  size: number;
  ipfsUri: string;
  url: string;
  publicGatewayUrl: string;
};

export async function uploadJSONToIpfs(data: any) {
  return axios.post<IpfsContent>('/ipfs-json-upload', data);
}

export async function uploadFiletoIpfs(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return axios.post<IpfsContent>('/ipfs-file-upload', formData);
}

// URI Utils

export function ipfsUriToCid(uri: string) {
  const baseRegex = /^ipfs:\/\//;
  const ipfsRegex = new RegExp(baseRegex.source + '.+');
  if (ipfsRegex.test(uri)) {
    return uri.replace(baseRegex, '');
  }
  return null;
}

export function ipfsUriToGatewayUrl(uri: string) {
  const cid = ipfsUriToCid(uri);
  return cid ? `https://cloudflare-ipfs.com/ipfs/${cid}` : uri;
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
