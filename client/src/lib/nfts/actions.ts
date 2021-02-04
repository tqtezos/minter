import { MichelsonMap } from '@taquito/taquito';
import { Buffer } from 'buffer';
import { SystemWithWallet } from '../system';
import faucetCode from './code/fa2_tzip16_compat_multi_nft_faucet';
import assetCode from './code/fa2_tzip16_compat_multi_nft_asset';

function toHexString(input: string) {
  return Buffer.from(input).toString('hex');
}

export async function createFaucetContract(
  system: SystemWithWallet,
  name: string
) {
  const metadata = new MichelsonMap<string, string>();
  const contents = {
    name,
    description: 'An OpenMinter base collection contract.',
    interfaces: ['TZIP-012', 'TZIP-016', 'TZIP-020'],
    tokenCategory: 'collectibles'
  };
  metadata.set('', toHexString('tezos-storage:contents'));
  metadata.set('contents', toHexString(JSON.stringify(contents)));
  return await system.toolkit.wallet
    .originate({
      code: faucetCode,
      storage: {
        assets: {
          ledger: new MichelsonMap(),
          next_token_id: 0,
          operators: new MichelsonMap(),
          token_metadata: new MichelsonMap()
        },
        metadata: metadata
      }
    })
    .send();
}

export async function createAssetContract(
  system: SystemWithWallet,
  name: string
) {
  const metadata = new MichelsonMap<string, string>();
  metadata.set('', toHexString('tezos-storage:contents'));
  const contents = {
    name,
    description: 'An OpenMinter assets contract.',
    interfaces: ['TZIP-012', 'TZIP-016', 'TZIP-020'],
    tokenCategory: 'collectibles'
  };
  metadata.set('contents', toHexString(JSON.stringify(contents)));
  return await system.toolkit.wallet
    .originate({
      code: assetCode,
      storage: {
        assets: {
          ledger: new MichelsonMap(),
          next_token_id: 0,
          operators: new MichelsonMap(),
          token_metadata: new MichelsonMap()
        },
        admin: {
          admin: system.tzPublicKey,
          pending_admin: null,
          paused: false
        },
        metadata: metadata
      }
    })
    .send();
}

export async function mintToken(
  system: SystemWithWallet,
  address: string,
  metadata: Record<string, string>
) {
  const contract = await system.toolkit.wallet.at(address);
  const storage = await contract.storage<any>();

  const token_id = storage.assets.next_token_id;
  const token_info = new MichelsonMap<string, string>();

  for (let key in metadata) {
    const value = toHexString(metadata[key]);
    token_info.set(key, value);
  }

  return contract.methods
    .mint([
      {
        owner: system.tzPublicKey,
        token_metadata: {
          token_id,
          token_info
        }
      }
    ])
    .send();
}

export async function transferToken(
  system: SystemWithWallet,
  contractAddress: string,
  tokenId: number,
  toAddress: string
) {
  const contract = await system.toolkit.wallet.at(contractAddress);
  return contract.methods
    .transfer([
      {
        from_: system.tzPublicKey,
        txs: [{ to_: toAddress, token_id: tokenId, amount: 1 }]
      }
    ])
    .send();
}
