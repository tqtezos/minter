import { System } from '../system';
import select from '../util/selectObjectByKeys';

export async function getContractNfts(system: System) {
  const storage = await system.betterCallDev.getContractStorage(
    system.config.contracts.nft
  );

  const ledgerBigMapId = select(storage, {
    type: 'big_map',
    name: 'ledger'
  })?.value;

  if (!ledgerBigMapId) return [];

  const tokensBigMapId = select(storage, {
    type: 'big_map',
    name: 'token_metadata'
  })?.value;

  if (!tokensBigMapId) return [];

  const ledger = await system.betterCallDev.getBigMapKeys(ledgerBigMapId);

  if (!ledger) return [];

  const tokens = await system.betterCallDev.getBigMapKeys(tokensBigMapId);

  if (!tokens) return [];

  return tokens.map((token: any) => {
    const tokenId = select(token, { name: 'token_id' })?.value;
    const metadataMap = select(token, { name: 'token_metadata_map' })?.children;
    const metadata = metadataMap.reduce((acc: any, next: any) => {
      return { ...acc, [next.name]: next.value };
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
      metadata: {}
    };
  });
}

export default {};
