import { BigNumber } from 'bignumber.js';
import { MichelsonMap, WalletContract } from '@taquito/taquito';

import { retrieveStorageField, Address, Nat } from './contractUtil';
import { waitForConfirmation } from '../utils/waitForConfirmation';
import { ApolloClient } from '@apollo/react-hooks';

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
  client: ApolloClient<object>,
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

    await waitForConfirmation(client, contract.address, () =>
      contract.methods.mint(params).send()
    );
  },

  async transferToken({ to, tokenId }) {
    const params = [
      {
        from_: ownerAddress,
        txs: [{ to_: to, token_id: tokenId, amount: new BigNumber(1) }]
      }
    ];

    await waitForConfirmation(client, contract.address, () =>
      contract.methods.transfer(params).send()
    );
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
