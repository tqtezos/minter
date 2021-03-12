import fs from 'fs';
import url from 'url';
import { promisify } from 'util';
import { IpfsConfig, IpfsProvider } from '../providers/ipfs';

const readFileAsync = promisify(fs.readFile);

export async function getConfig(): Promise<IpfsConfig> {
  try {
    const path = url.resolve(__dirname, './config.json');
    const config = JSON.parse(await readFileAsync(path, { encoding: 'utf8' }));
    return config;
  } catch (e) {
    return {};
  }
}

export async function getProvider(): Promise<IpfsProvider> {
  return new IpfsProvider(await getConfig());
}
