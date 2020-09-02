import { importSchema } from 'graphql-import';

import createContext from './components/context';
import runHttpServer from './components/http_server';
import path from 'path';

process.on('unhandledRejection', (reason, _promise) => {
  console.log('[Process] Unhandled Promise Rejection:', reason);
});

process.on('uncaughtException', error => {
  console.log('[Process] Uncaught Exception:', error);
});

const IS_DEV_ENV = !['production', 'test'].includes(process.env.NODE_ENV || '');

const typeDefs = importSchema(path.resolve(__dirname + '/schema.graphql'));

async function run() {
  const envPort = process.env.MINTER_API_PORT;
  const port = envPort ? parseInt(envPort) : 3300;
  const context = await createContext();

  runHttpServer(context, typeDefs, port, IS_DEV_ENV);
}

async function main() {
  // Uncomment below to view the environment on startup
  // if (IS_DEV_ENV) {
  //   console.log(process.env);
  // }
  try {
    await run();
  } catch (e) {
    console.log('FATAL - an error occurred during startup:');
    console.dir(e);
    process.exit(1);
  }
}

main();
