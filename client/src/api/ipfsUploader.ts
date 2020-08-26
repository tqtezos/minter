import IpfsClient from 'ipfs-http-client';

/**
 * Promisified version of FileReader.readAsArrayBuffer 
 */
const readBlobAsArrayBuffer = (blob: Blob): Promise<ArrayBuffer> => (
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => { resolve(reader.result as ArrayBuffer); };
    reader.onerror = () => { reject(reader.error); reader.abort(); };

    reader.readAsArrayBuffer(blob);
  })
)

const ipfsClient = IpfsClient('http://localhost:5001')

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
    url: `http://localhost:8080/ipfs/${ipfsFile.cid}`,
    publicGatewayUrl: `https://ipfs.io/ipfs/${ipfsFile.cid}`
  }
}

export default uploadToIpfs;
