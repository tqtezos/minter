import express, { Express, Response } from 'express';
import IpfsClient from 'ipfs-http-client';
import url from 'url';
import bodyParser from 'body-parser';
import fileUpload from 'express-fileupload';
import http from 'http';

// TODO: Move this configuration to a JSON definition
const ipfsConfig = {
  // The URL of our IPFS API server, our Web UI uploads files to.
  apiUrl: 'http://ipfs:5001',

  // The URL of our IPFS gateway server, which can be used for fast file download
  // It is the same server as the one running IPFS API.
  gatewayUrl: 'http://127.0.0.1:8080/',

  // The URL of a public IPFS read-only gateway server. It may take time to
  // propagate information from our IPFS server to a public one.
  // It can be also used for file download but it may be very slow.
  publicGatewayUrl: 'https://ipfs.io/'
};

function createHttpServer(app: Express) {
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.use(
    fileUpload({
      limits: { fileSize: 10 * 1024 * 1024 } // 20MB
    })
  );

  app.post('/ipfs-upload', async (req: any, res: Response) => {
    if (!req.files?.file?.data) {
      throw Error('No file data found');
    }

    const ipfsClient = IpfsClient(ipfsConfig.apiUrl);
    const ipfsFile = await ipfsClient.add(req.files.file.data);
    const cid = ipfsFile.cid.toString();

    return res.status(200).send({
      cid,
      size: ipfsFile.size,
      url: url.resolve(ipfsConfig.gatewayUrl, `ipfs/${cid}`),
      publicGatewayUrl: url.resolve(ipfsConfig.publicGatewayUrl, `ipfs/${cid}`)
    });
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
  createHttpServer(app).listen(port, () => {
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
