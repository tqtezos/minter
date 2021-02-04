import axios from 'axios';
import fs from 'fs';
import url from 'url';
import sharp from 'sharp';
import FormData from 'form-data';
import { promisify } from 'util';
import { ipfsConfig } from './ipfs';

const readFileAsync = promisify(fs.readFile);

// Configuration

export interface PinataConfig {
  apiKey: string;
  apiSecret: string;
}

export async function getPinataConfig(): Promise<PinataConfig | null> {
  try {
    const path = url.resolve(__dirname, './config.json');
    const config = JSON.parse(await readFileAsync(path, { encoding: 'utf8' }));
    const apiKey = config?.pinata?.apiKey;
    const apiSecret = config?.pinata?.apiSecret;

    if (!(typeof apiKey === 'string' && typeof apiSecret === 'string')) {
      return null;
    }

    return {
      apiKey,
      apiSecret
    };
  } catch (e) {
    return null;
  }
}

// Helper Functions

export async function uploadFileToPinata(
  pinataConfig: PinataConfig,
  path: string
) {
  const pinataUrl = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
  const formData = new FormData();
  formData.append('file', fs.createReadStream(path));

  const pinataRes = await axios.post(pinataUrl, formData, {
    maxContentLength: Infinity,
    headers: {
      'Content-Type': `multipart/form-data; boundary=${
        (formData as any)._boundary
      }`,
      pinata_api_key: pinataConfig.apiKey,
      pinata_secret_api_key: pinataConfig.apiSecret
    }
  });

  const pinataData = pinataRes.data;
  const cid = pinataData.IpfsHash;

  return {
    cid,
    size: pinataData.PinSize,
    ipfsUri: `ipfs://${cid}`,
    url: url.resolve(ipfsConfig.pinataGatewayUrl, `ipfs/${cid}`),
    publicGatewayUrl: url.resolve(ipfsConfig.publicGatewayUrl, `ipfs/${cid}`)
  };
}

export async function uploadImageWithThumbnailToPinata(
  pinataConfig: PinataConfig,
  path: string
) {
  const thumbnailPath = `${path}-thumbnail`;
  await sharp(path).resize(200, 200).toFile(thumbnailPath);

  const origFile = await uploadFileToPinata(pinataConfig, path);
  const thumbnailFile = await uploadFileToPinata(pinataConfig, thumbnailPath);
  fs.unlink(thumbnailPath, () => null);
  return {
    ...origFile,
    thumbnail: thumbnailFile
  };
}

export async function uploadJSONToPinata(
  pinataConfig: PinataConfig,
  json: any
) {
  const pinataUrl = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
  const pinataRes = await axios.post(pinataUrl, json, {
    headers: {
      pinata_api_key: pinataConfig.apiKey,
      pinata_secret_api_key: pinataConfig.apiSecret
    }
  });

  const pinataData = pinataRes.data;
  const cid = pinataData.IpfsHash;

  return {
    cid,
    size: pinataData.PinSize,
    ipfsUri: `ipfs://${cid}`,
    url: url.resolve(ipfsConfig.pinataGatewayUrl, `ipfs/${cid}`),
    publicGatewayUrl: url.resolve(ipfsConfig.publicGatewayUrl, `ipfs/${cid}`)
  };
}
