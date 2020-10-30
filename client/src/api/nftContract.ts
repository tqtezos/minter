import { BigNumber } from 'bignumber.js';
import { MichelsonMap, WalletContract } from '@taquito/taquito';

import { retrieveStorageField, Address, Nat } from './contractUtil';

interface CreateTokenArgs {
  symbol: string;
  name: string;
  description: string;
  ipfsCid: string;
}

interface TransferTokenArgs {
  to: Address;
  tokenId: BigNumber;
}

export interface NftContract {
  createToken(args: CreateTokenArgs): Promise<void>;
  transferToken(args: TransferTokenArgs): Promise<void>;
}

const mkNftContract = async (
  contract: WalletContract,
  ownerAddress: Address
): Promise<NftContract> => ({
  async createToken({ symbol, name, description, ipfsCid }) {
    const tokenId = await retrieveStorageField<Nat>(contract, 'next_token_id');

    const params = [
      {
        metadata: {
          token_id: tokenId,
          symbol,
          name,
          decimals: new BigNumber(0),
          extras: createExtras(description, ipfsCid)
        },
        owner: ownerAddress
      }
    ];

    const operation = await contract.methods.mint(params).send();
    await operation.confirmation();
  },

  async transferToken({ to, tokenId }) {
    const params = [
      {
        from_: ownerAddress,
        txs: [{ to_: to, token_id: tokenId, amount: new BigNumber(1) }]
      }
    ];

    const operation = await contract.methods.transfer(params).send();
    await operation.confirmation();
  }
});

const createExtras = (description: string, ipfsCid: string) => {
  const extras = new MichelsonMap<string, string>({
    prim: 'map',
    args: [{ prim: 'string' }, { prim: 'string' }]
  });

  extras.set('description', description);
  extras.set('ipfs_cid', ipfsCid);

  return extras;
};

export default mkNftContract;
