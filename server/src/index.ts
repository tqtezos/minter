import express, { Express } from 'express';
import bodyParser from 'body-parser';
import fileUpload from 'express-fileupload';
import http from 'http';
import fs from 'fs';
import { getPinataConfig } from './helpers/pinata';
import { handleIpfsFileUpload, handleIpfsJSONUpload } from './handlers';

if (!fs.existsSync('./tmp')) {
  fs.mkdirSync('./tmp');
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
