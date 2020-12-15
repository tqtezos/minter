import Configstore from 'configstore';
import path from 'path';

function getEnv(envVar: string) {
  const value = process.env[envVar];
  if (!value) throw Error(`${envVar} environment variable is not set`);
  return value;
}

function buildConfigStore() {
  const tzNetwork = getEnv('TZ_NETWORK');
  const configName = `minter.${tzNetwork}.json`;
  const configPath = path.join(__dirname, '../../config/', configName);
  return new Configstore('', {}, { configPath });
}

export interface Context {
  bcdApiUrl: string;
  bcdGuiUrl: string;
  bcdNetwork: string;
  tzRpcUrl: string;
  configStore: Configstore;
}

export default async function createContext(): Promise<Context> {
  return {
    tzRpcUrl: getEnv('TEZOS_RPC_URL'),
    bcdApiUrl: getEnv('BCD_API_URL'),
    bcdGuiUrl: getEnv('BCD_GUI_URL'),
    bcdNetwork: getEnv('BCD_NETWORK'),
    configStore: buildConfigStore()
  };
}
