import url from 'url';
import IpfsClient from 'ipfs-http-client';

const config = {
  ipfs: {
    // The URL of our IPFS API server, our Web UI uploads files to.
    apiUrl: 'http://localhost:5001',

    // The URL of our IPFS gateway server, which can be used for fast file download
    // It is the same server as the one running IPFS API.
    gatewayUrl: 'http://127.0.0.1:8080/',

    // The URL of a public IPFS read-only gateway server. It may take time to
    // propagate information from our IPFS server to a public one.
    // It can be also used for file download but it may be very slow.
    publicGatewayUrl: 'https://ipfs.io/'
  }
};

/**
 * Promisified version of FileReader.readAsArrayBuffer
 */
const readBlobAsArrayBuffer = (blob: Blob): Promise<ArrayBuffer> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result as ArrayBuffer);
    };
    reader.onerror = () => {
      reject(reader.error);
      reader.abort();
    };

    reader.readAsArrayBuffer(blob);
  });

const ipfsClient = IpfsClient(config.ipfs.apiUrl);

export interface IpfsContent {
  // Content identifier, also known as 'hash'
  cid: string;

  // The size of the content in bytes
  size: number;

  // URL of the content on the IPFS server it was uploaded to (fast download)
  url: string;

  // URL of the content on one of the pubic IPFS servers (it may take a long time to download)
  publicGatewayUrl: string;
}

const uploadToIpfs = async (blob: Blob): Promise<IpfsContent> => {
  const buffer = await readBlobAsArrayBuffer(blob);
  const ipfsFile = await ipfsClient.add(buffer);

  return {
    cid: ipfsFile.cid.toString(),
    size: ipfsFile.size,
    url: url.resolve(config.ipfs.gatewayUrl, `ipfs/${ipfsFile.cid}`),
    publicGatewayUrl: url.resolve(
      config.ipfs.publicGatewayUrl,
      `ipfs/${ipfsFile.cid}`
    )
  };
};

export const urlFromCid = (cid: string) =>
  url.resolve(config.ipfs.gatewayUrl, `ipfs/${cid}`);

export default uploadToIpfs;
