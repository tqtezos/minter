import { Buffer } from 'buffer';
import { System, SystemWithWallet } from '../system';
import { hash as nftAssetHash } from './code/fa2_tzip16_compat_multi_nft_asset';
import select from '../util/selectObjectByKeys';

function fromHexString(input: string) {
  if (/^([A-Fa-f0-9]{2})*$/.test(input)) {
    return Buffer.from(input, 'hex').toString();
  }
  return input;
}

function foldBigMapResponseAsObject(bigMapResponse: any) {
  return bigMapResponse.reduce((acc: {}, next: any) => {
    return { ...acc, [next.data.key_string]: next.data.value.value };
  }, {});
}

export async function getContractNfts(system: System, address: string) {
  const storage = await system.betterCallDev.getContractStorage(address);

  const ledgerBigMapId = select(storage, {
    type: 'big_map',
    name: 'ledger'
  })?.value;

  if (ledgerBigMapId === undefined || ledgerBigMapId === null) return [];

  const tokensBigMapId = select(storage, {
    type: 'big_map',
    name: 'token_metadata'
  })?.value;

  if (tokensBigMapId === undefined || ledgerBigMapId === null) return [];

  const ledger = await system.betterCallDev.getBigMapKeys(ledgerBigMapId);

  if (!ledger) return [];

  const tokens = await system.betterCallDev.getBigMapKeys(tokensBigMapId);

  if (!tokens) return [];

  return tokens.map((token: any) => {
    const tokenId = select(token, { name: 'token_id' })?.value;
    const metadataMap = select(token, { name: 'token_metadata_map' })?.children;
    const metadata = metadataMap.reduce((acc: any, next: any) => {
      return { ...acc, [next.name]: fromHexString(next.value) };
    }, {});

    const owner = select(
      ledger.filter((v: any) => v.data.key.value === tokenId),
      {
        type: 'address'
      }
    )?.value;

    return {
      id: parseInt(tokenId, 10),
      title: metadata.name,
      owner,
      description: metadata.description,
      ipfs_hash: metadata.ipfs_hash,
      metadata: metadata
    };
  });
}

export async function getNftAssetContract(system: System, address: string) {
  const bcd = system.betterCallDev;
  const storage = await bcd.getContractStorage(address);

  const metadataBigMapId = select(storage, {
    type: 'big_map',
    name: 'metadata'
  })?.value;

  const metadataResponse = await bcd.getBigMapKeys(metadataBigMapId);
  const metadata = foldBigMapResponseAsObject(metadataResponse);
  return { address, metadata };
}

export async function getWalletNftAssetContracts(system: SystemWithWallet) {
  const bcd = system.betterCallDev;
  const response = await bcd.getWalletContracts(system.tzPublicKey);

  const assetContracts = response.items.filter(
    (i: any) => i.body.hash === nftAssetHash
  );

  const results: any[] = [];
  for (let assetContract of assetContracts) {
    const result = await getNftAssetContract(system, assetContract.value);
    results.push(result);
  }

  return results;
}
