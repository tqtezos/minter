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
