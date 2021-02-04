import express, { Express, Request, Response } from 'express';
import IpfsClient from 'ipfs-http-client';
import url from 'url';
import bodyParser from 'body-parser';
import fileUpload, { UploadedFile } from 'express-fileupload';
import http from 'http';
import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';
import { promisify } from 'util';

const readFileAsync = promisify(fs.readFile);

// TODO: Move this configuration to a JSON definition
const ipfsConfig = {
  apiUrl: 'http://ipfs:5001',
  gatewayUrl: 'http://127.0.0.1:8080/',
  pinataGatewayUrl: 'https://gateway.pinata.cloud/',
  publicGatewayUrl: 'https://cloudflare-ipfs.com/'
};

interface PinataConfig {
  apiKey: string;
  apiSecret: string;
}

async function uploadFileToPinata(
  pinataConfig: PinataConfig,
  file: UploadedFile,
  res: Response
) {
  try {
    const pinataUrl = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
    const formData = new FormData();
    formData.append('file', fs.createReadStream(file.tempFilePath));

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

    return res.status(200).send({
      cid,
      size: pinataData.PinSize,
      ipfsUri: `ipfs://${cid}`,
      url: url.resolve(ipfsConfig.pinataGatewayUrl, `ipfs/${cid}`),
      publicGatewayUrl: url.resolve(ipfsConfig.publicGatewayUrl, `ipfs/${cid}`)
    });
  } catch (e) {
    console.log(e);
  }
}

async function uploadJSONToPinata(
  pinataConfig: PinataConfig,
  req: Request,
  res: Response
) {
  try {
    const pinataUrl = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
    const pinataRes = await axios.post(pinataUrl, req.body, {
      headers: {
        pinata_api_key: pinataConfig.apiKey,
        pinata_secret_api_key: pinataConfig.apiSecret
      }
    });

    const pinataData = pinataRes.data;
    const cid = pinataData.IpfsHash;

    return res.status(200).send({
      cid,
      size: pinataData.PinSize,
      ipfsUri: `ipfs://${cid}`,
      url: url.resolve(ipfsConfig.pinataGatewayUrl, `ipfs/${cid}`),
      publicGatewayUrl: url.resolve(ipfsConfig.publicGatewayUrl, `ipfs/${cid}`)
    });
  } catch (e) {
    console.log(e);
  }
}

async function uploadToIpfs(data: any, res: Response) {
  const ipfsClient = IpfsClient(ipfsConfig.apiUrl);
  const ipfsFile = await ipfsClient.add(data);
  const cid = ipfsFile.cid.toString();

  return res.status(200).send({
    cid,
    size: ipfsFile.size,
    ipfsUri: `ipfs://${cid}`,
    url: url.resolve(ipfsConfig.gatewayUrl, `ipfs/${cid}`),
    publicGatewayUrl: url.resolve(ipfsConfig.gatewayUrl, `ipfs/${cid}`)
  });
}

async function getPinataConfig(): Promise<PinataConfig | null> {
  try {
    const path = `${__dirname}/config.json`;
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

async function handleIpfsFileUpload(
  pinataConfig: PinataConfig | null,
  req: Request,
  res: Response
) {
  const file = req.files?.file;
  if (!file?.data) {
    throw Error('No file data found');
  }

  if (pinataConfig) {
    return await uploadFileToPinata(pinataConfig, file, res);
  }
  const data = fs.readFileSync(file.tempFilePath);
  return await uploadToIpfs(data, res);
}

async function handleIpfsJSONUpload(
  pinataConfig: PinataConfig | null,
  req: Request,
  res: Response
) {
  if (!req.body) {
    throw Error('No file data found');
  }

  if (pinataConfig) {
    return await uploadJSONToPinata(pinataConfig, req, res);
  }

  return await uploadToIpfs(req.body, res);
}

async function createHttpServer(app: Express) {
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.use(
    fileUpload({
      limits: { fileSize: 30 * 1024 * 1024 }, // 30MB
      useTempFiles: true
    })
  );

  const pinataConfig = await getPinataConfig();

  app.post('/ipfs-file-upload', (req, res) => {
    return handleIpfsFileUpload(pinataConfig, req, res);
  });

  app.post('/ipfs-json-upload', (req, res) => {
    return handleIpfsJSONUpload(pinataConfig, req, res);
  });

  const httpServer = http.createServer(app);
  return httpServer;
}

process.on('unhandledRejection', (reason, _promise) => {
  console.log('[Process] Unhandled Promise Rejection:', reason);
});

process.on('uncaughtException', error => {
  console.log('[Process] Uncaught Exception:', error);
});

async function run() {
  const envPort = process.env.MINTER_API_PORT;
  const port = envPort ? parseInt(envPort) : 3300;
  const app = express();
  const server = await createHttpServer(app);
  server.listen(port, () => {
    console.log(`[Server] Serving on port ${port}`);
  });
}

async function main() {
  try {
    await run();
  } catch (e) {
    console.log('FATAL - an error occurred during startup:');
    console.dir(e);
    process.exit(1);
  }
}

main();
