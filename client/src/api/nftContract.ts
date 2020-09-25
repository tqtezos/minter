import { TezosToolkit, MichelsonMap } from '@taquito/taquito';
import { BigNumber } from 'bignumber.js';
import { retrieveStorageField, address } from './contractUtil';

interface CreateTokenArgs {
  ownerAddress: address;
  symbol: string;
  name: string;
  description: string;
  ipfsCid: string;
}

export interface NftContract {
  createToken(args: CreateTokenArgs): Promise<number>;
}

const mkNftContract = async (
  tzClient: TezosToolkit,
  contractAddress: address
): Promise<NftContract> => {
  const contract = await tzClient.contract.at(contractAddress);

  return {
    async createToken({
      ownerAddress,
      symbol,
      name,
      description,
      ipfsCid
    }: CreateTokenArgs): Promise<number> {
      const tokenId = await retrieveStorageField(contract, 'next_token_id');

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
      return operation.confirmation(1);
    }
  };
};

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
