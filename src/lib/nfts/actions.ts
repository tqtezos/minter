import { MichelsonMap } from '@taquito/taquito';
import {
  Fa2MultiNftAssetCode,
  Fa2MultiNftFaucetCode
} from '@tqtezos/minter-contracts';
import { Buffer } from 'buffer';
import { SystemWithWallet } from '../system';
import { uploadIPFSJSON } from '../util/ipfs';
import { NftMetadata } from './queries';

function toHexString(input: string) {
  return Buffer.from(input).toString('hex');
}

export async function createFaucetContract(
  system: SystemWithWallet,
  name: string
) {
  const metadataMap = new MichelsonMap<string, string>();
  const resp = await uploadIPFSJSON(system.config.ipfsApi, {
    name,
    description: 'An OpenMinter base collection contract.',
    interfaces: ['TZIP-012', 'TZIP-016', 'TZIP-020'],
    tokenCategory: 'collectibles'
  });
  metadataMap.set('', toHexString(resp.data.ipfsUri));
  return await system.toolkit.wallet
    .originate({
      code: Fa2MultiNftFaucetCode.code,
      storage: {
        assets: {
          ledger: new MichelsonMap(),
          next_token_id: 0,
          operators: new MichelsonMap(),
          token_metadata: new MichelsonMap()
        },
        metadata: metadataMap
      }
    })
    .send();
}

export async function createAssetContract(
  system: SystemWithWallet,
  metadata: Record<string, string>
) {
  const metadataMap = new MichelsonMap<string, string>();
  const resp = await uploadIPFSJSON(system.config.ipfsApi, {
    description: 'An OpenMinter assets contract.',
    interfaces: ['TZIP-012', 'TZIP-016', 'TZIP-020'],
    tokenCategory: 'collectibles',
    ...metadata
  });
  metadataMap.set('', toHexString(resp.data.ipfsUri));
  return await system.toolkit.wallet
    .originate({
      code: Fa2MultiNftAssetCode.code,
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
        metadata: metadataMap
      }
    })
    .send();
}

export async function mintToken(
  system: SystemWithWallet,
  address: string,
  metadata: NftMetadata
) {
  const contract = await system.toolkit.wallet.at(address);
  const storage = await contract.storage<any>();

  const token_id = storage.assets.next_token_id;
  const token_info = new MichelsonMap<string, string>();
  const resp = await uploadIPFSJSON(system.config.ipfsApi, {
    ...metadata,
    decimals: 0,
    booleanAmount: true
  });
  token_info.set('', toHexString(resp.data.ipfsUri));

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

export async function listTokenForSale(
  system: SystemWithWallet,
  marketplaceContract: string,
  tokenContract: string,
  tokenId: number,
  salePrice: number
) {
  const contractM = await system.toolkit.wallet.at(marketplaceContract);
  const contractT = await system.toolkit.wallet.at(tokenContract);
  const batch = await system.toolkit.wallet
    .batch([])
    .withContractCall(
      contractT.methods.update_operators([
        {
          add_operator: {
            owner: system.tzPublicKey,
            operator: marketplaceContract,
            token_id: tokenId
          }
        }
      ])
    )
    .withContractCall(
      contractM.methods.sell(salePrice, tokenContract, tokenId)
    );
  return batch.send();
}

export async function cancelTokenSale(
  system: SystemWithWallet,
  marketplaceContract: string,
  tokenContract: string,
  tokenId: number
) {
  const contractM = await system.toolkit.wallet.at(marketplaceContract);
  const contractT = await system.toolkit.wallet.at(tokenContract);
  const batch = await system.toolkit.wallet
    .batch([])
    .withContractCall(
      contractM.methods.cancel(system.tzPublicKey, tokenContract, tokenId)
    )
    .withContractCall(
      contractT.methods.update_operators([
        {
          remove_operator: {
            owner: system.tzPublicKey,
            operator: marketplaceContract,
            token_id: tokenId
          }
        }
      ])
    );
  return batch.send();
}

export async function approveTokenOperator(
  system: SystemWithWallet,
  contractAddress: string,
  tokenId: number,
  operatorAddress: string
) {
  const contract = await system.toolkit.wallet.at(contractAddress);
  return contract.methods
    .update_operators([
      {
        add_operator: {
          owner: system.tzPublicKey,
          operator: operatorAddress,
          token_id: tokenId
        }
      }
    ])
    .send();
}

export async function removeTokenOperator(
  system: SystemWithWallet,
  contractAddress: string,
  tokenId: number,
  operatorAddress: string
) {
  const contract = await system.toolkit.wallet.at(contractAddress);
  return contract.methods
    .update_operators([
      {
        remove_operator: {
          owner: system.tzPublicKey,
          operator: operatorAddress,
          token_id: tokenId
        }
      }
    ])
    .send();
}

export async function buyToken(
  system: SystemWithWallet,
  marketplaceContract: string,
  tokenContract: string,
  tokenId: number,
  tokenSeller: string,
  salePrice: number
) {
  const contract = await system.toolkit.wallet.at(marketplaceContract);
  return contract.methods
    .buy(tokenSeller, tokenContract, tokenId)
    .send({ amount: salePrice });
}
