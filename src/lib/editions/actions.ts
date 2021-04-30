import { MichelsonMap } from '@taquito/taquito';
import { SystemWithWallet } from '../system';
import { uploadIPFSJSON } from '../util/ipfs';
import {
  Fa2MultiNftTokenEditionsCode,
  EditionsTokenMetadataViewCode
} from '@tqtezos/minter-contracts';
import { NftMetadata } from '../nfts/decoders';

function toHexString(input: string) {
  return Buffer.from(input).toString('hex');
}

const editionsTokenMetadataView = {
  name: 'token_metadata',
  description: 'Get the metadata for the tokens minted using this contract',
  pure: true,
  implementations: [
    {
      michelsonStorageView: {
        parameter: {
          prim: 'nat'
        },
        returnType: {
          prim: 'pair',
          args: [
            { prim: 'nat', annots: ['%token_id'] },
            {
              prim: 'map',
              args: [{ prim: 'string' }, { prim: 'bytes' }],
              annots: ['%token_info']
            }
          ]
        },
        code: EditionsTokenMetadataViewCode.code
      }
    }
  ]
};

export async function createEditionsContract(
  system: SystemWithWallet,
  metadata: Record<string, string>
) {
  const metadataMap = new MichelsonMap<string, string>();
  const resp = await uploadIPFSJSON(system.config.ipfsApi, {
    name: 'Minter Editions Contract',
    description: 'editions',
    interfaces: ['TZIP-012', 'TZIP-016', 'TZIP-020'],
    views: [editionsTokenMetadataView],
    ...metadata
  });
  metadataMap.set('', toHexString(resp.data.ipfsUri));

  return await system.toolkit.wallet
    .originate({
      code: Fa2MultiNftTokenEditionsCode.code,
      storage: {
        nft_asset_storage: {
          assets: {
            ledger: new MichelsonMap(),
            operators: new MichelsonMap()
          },
          admin: {
            admin: system.tzPublicKey,
            pending_admin: null,
            paused: false
          },
          metadata: metadataMap
        },
        editions_metadata: new MichelsonMap(),
        max_editions_per_run: 10000,
        next_edition_id: 0
      }
    })
    .send();
}

export async function mintToken(
  system: SystemWithWallet,
  address: string,
  metadata: NftMetadata,
  amount: number
) {
  const contract = await system.toolkit.wallet.at(address);
  const edition_info = new MichelsonMap<string, string>();
  const resp = await uploadIPFSJSON(system.config.ipfsApi, {
    ...metadata,
    decimals: 0,
    booleanAmount: true
  });
  edition_info.set('', toHexString(resp.data.ipfsUri));

  return contract.methods
    .mint([{ edition_info, number_of_editions: amount }])
    .send();
}
