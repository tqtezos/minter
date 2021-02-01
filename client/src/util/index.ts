export function ipfsCidFromUri(uri: string) {
  const reBaseStr = /.*\/ipfs\//;
  if (reBaseStr.test(uri)) {
    return uri.replace(reBaseStr, '');
  }
  return uri;
}
