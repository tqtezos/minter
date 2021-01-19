import { mkBetterCallDev } from './betterCallDev';

export async function indexerStats(bcdApiUrl: string, bcdNetwork: string) {
  const s = await mkBetterCallDev(bcdApiUrl, bcdNetwork).stats();
  return s[0];
}
