import { gql, useMutation } from '@apollo/client';     

const CREATE_NON_FUNGIBLE_TOKEN = gql`
  mutation CreateNonFungibleTokenSync(
    $ownerAddress: String!
    $name: String!
    $description: String!
    $symbol: String!
    $ipfsCid: String!
  ) {
    createNonFungibleTokenSync(
      owner_address: $ownerAddress
      name: $name
      description: $description
      symbol: $symbol
      ipfs_cid: $ipfsCid
    ) {
      hash
      initiator,
      status
    }
  }
`;

interface Variables {
  ownerAddress: string;
  name: string;
  description: string;
  symbol: string;
  ipfsCid: string;
}

interface Data {
  hash: string;
  initiator: string;
  status: string;
}

export default () => {
  const [createNonFungibleToken, { data, loading, error }] = useMutation<Data, Variables>(
    CREATE_NON_FUNGIBLE_TOKEN
  );
  
  return {
    createNonFungibleToken,
    data,
    loading,
    error
  }
}
