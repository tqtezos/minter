import { gql, useQuery } from '@apollo/client';
import { useEffect, useState } from 'react';
import { NonFungibleToken, QueryNftsByOwnerArgs } from '../../generated/graphql_schema';
import { useTzToolkit } from '../App/globalContext';

const NFTS = gql`
  query Nfts {
    nfts {
      token_id
      symbol
      name
      owner
      extras
    }
  }
`;

const NFTS_BY_OWNER = gql`
  query NftsByOwner($owner_address: String!) {
    nftsByOwner(owner_address: $owner_address) {
      token_id
      symbol
      name
      owner
      extras
    }  
  }
`;

export interface Nfts {
  nfts: NonFungibleToken[]
}
export interface NftsByOwner {
  nftsByOwner: NonFungibleToken[]
}

export const useNftsQuery =  () => {
  const [address, setAddress] = useState<string | undefined>();
  const tzToolkit = useTzToolkit();
  
  useEffect(() => {
    if (tzToolkit) {
      tzToolkit.wallet.pkh().then(setAddress)
    } else {
      setAddress(undefined);
    }
  }, [tzToolkit]);

  const nfts = useQuery<Nfts, void>(NFTS, {
    skip: address != null,
    fetchPolicy: 'network-only' 
  });
  
  const nftsByOwner = useQuery<NftsByOwner, QueryNftsByOwnerArgs>(NFTS_BY_OWNER, { 
    skip: address == null,
    variables: { owner_address: address || '' }, 
    fetchPolicy: 'network-only' ,
  });

  return address ? { 
      ...nftsByOwner, 
      data: nftsByOwner.data?.nftsByOwner 
    } : { 
      ...nfts, 
      data: nfts.data?.nfts 
    };
}
