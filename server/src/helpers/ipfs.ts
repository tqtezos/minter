import fs from 'fs';
import url from 'url';
import sharp from 'sharp';
import IpfsClient from 'ipfs-http-client';

// TODO: Move this configuration to a JSON definition
export const ipfsConfig = {
  apiUrl: 'http://ipfs:5001',
  gatewayUrl: 'http://127.0.0.1:8080/',
  pinataGatewayUrl: 'https://gateway.pinata.cloud/',
  publicGatewayUrl: 'https://cloudflare-ipfs.com/'
};

export async function uploadDataToIpfs(data: any) {
  const ipfsClient = IpfsClient(ipfsConfig.apiUrl);
  const ipfsFile = await ipfsClient.add(data);
  const cid = ipfsFile.cid.toString();

  return {
    cid,
    size: ipfsFile.size,
    ipfsUri: `ipfs://${cid}`,
    url: url.resolve(ipfsConfig.gatewayUrl, `ipfs/${cid}`),
    publicGatewayUrl: url.resolve(ipfsConfig.gatewayUrl, `ipfs/${cid}`)
  };
}

export async function uploadImageWithThumbnailToIpfs(path: string) {
  const thumbnailPath = `${path}-thumbnail`;
  await sharp(path).resize(200, 200).toFile(thumbnailPath);

  const origFile = await uploadDataToIpfs(fs.createReadStream(path));
  const thumbnailFile = await uploadDataToIpfs(
    fs.createReadStream(thumbnailPath)
  );
  fs.unlink(thumbnailPath, () => null);
  return {
    ...origFile,
    thumbnail: thumbnailFile
  };
}
