import React, { useContext, useEffect, useState } from 'react';
import { Flex, Heading, Text } from '@chakra-ui/react';
import { CreateCollectionButton } from '../common/CreateCollection';
import { State, DispatchFn } from './reducer';
import { SystemContext } from '../../context/system';
import { getWalletNftAssetContracts } from '../../lib/nfts/queries';

// Placeholder data
const collections: { name: string; address: string }[] = [
  { name: 'Minter', address: '123' },
  { name: 'Digital Art', address: '456' },
  { name: 'Misc Stuff', address: '789' }
];

interface CollectionRowProps {
  name: string;
  address: string;
  dispatch: DispatchFn;
  state: State;
}

function CollectionRow(props: CollectionRowProps) {
  const selected = props.state.collectionAddress === props.address;
  return (
    <Flex
      align="center"
      py={4}
      px={4}
      mb={4}
      border="1px solid"
      borderColor={selected ? 'brand.blue' : 'brand.brightGray'}
      borderRadius="4px"
      bg={selected ? 'brand.blue' : 'white'}
      _hover={{
        cursor: 'pointer'
      }}
      onClick={() =>
        props.dispatch({
          type: 'select_collection',
          payload: { address: props.address }
        })
      }
    >
      <Flex
        align="center"
        justify="center"
        w={8}
        h={8}
        bg={selected ? 'white' : 'brand.blue'}
        color={selected ? 'brand.blue' : 'white'}
        borderRadius="100%"
        fontWeight="600"
      >
        <Text>{props.name[0]}</Text>
      </Flex>
      <Text
        color={selected ? 'white' : 'black'}
        pl={4}
        fontSize="md"
        fontWeight={selected ? '600' : 'normal'}
      >
        {props.name}
      </Text>
    </Flex>
  );
}

const globalCollectionAddress = 'KT1WVZ8qJBXX2yu9EMixhb32d8KNoWnJ9vAm';

const globalCollection = {
  address: globalCollectionAddress,
  metadata: {
    name: 'Minter'
  }
};

export default function CollectionSelect(props: {
  state: State;
  dispatch: DispatchFn;
}) {
  const { system } = useContext(SystemContext);
  const [collections, setCollections] = useState<any[]>([]);

  useEffect(() => {
    if (system.status !== 'WalletConnected') {
      return;
    }
    getWalletNftAssetContracts(system).then(collections => {
      setCollections([globalCollection, ...collections]);
    });
  }, [system.status]);

  if (system.status !== 'WalletConnected') {
    return null;
  }

  return (
    <Flex flexDir="column" pt={8}>
      <Flex
        align="center"
        justify="space-between"
        mb={4}
        pb={4}
        borderBottom="1px solid"
        borderColor="brand.brightGray"
      >
        <Heading size="lg">Collections</Heading>
        <CreateCollectionButton />
      </Flex>
      {collections.map(({ address, metadata }) => {
        return (
          <CollectionRow
            key={address}
            name={metadata.name || address}
            address={address}
            dispatch={props.dispatch}
            state={props.state}
          />
        );
      })}
    </Flex>
  );
}
