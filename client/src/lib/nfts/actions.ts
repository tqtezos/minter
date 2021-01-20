import { SystemWithWallet } from '../system';
import { MichelsonMap } from '@taquito/taquito';
import code from './fa2_multi_nft_faucet_tzip16_compat';

export async function createContract(system: SystemWithWallet, name: string) {
  const metadata = new MichelsonMap<string, string>();
  metadata.set('name', name);
  await system.toolkit.wallet
    .originate({
      code: code,
      storage: {
        ledger: new MichelsonMap(),
        next_token_id: 0,
        operators: new MichelsonMap(),
        token_metadata: new MichelsonMap(),
        metadata: metadata
      }
    })
    .send();
}

function toHexString(input: string): string {
  const unit8Array: Uint8Array = new TextEncoder().encode(input);
  return Array.from(unit8Array, (byte: number) => {
    return ('0' + (byte & 0xff).toString(16)).slice(-2);
  }).join('');
}

export async function mintToken(
  system: SystemWithWallet,
  address: string,
  metadata: Record<string, string>
) {
  const contract = await system.toolkit.wallet.at(address);
  const storage = await contract.storage<any>();

  const owner = await system.wallet.getPKH();
  const token_id = storage.next_token_id;
  const token_metadata_map = new MichelsonMap<string, string>();

  for (let key in metadata) {
    const value = toHexString(metadata[key]);
    token_metadata_map.set(key, value);
  }

  return contract.methods
    .mint([
      {
        owner,
        token_metadata: {
          token_id,
          token_metadata_map
        }
      }
    ])
    .send();
}

export default {};
