import React, { useEffect } from 'react';
import { Flex, Heading, Text } from '@chakra-ui/react';
import { CreateCollectionButton } from '../common/CreateCollection';
import { useSelector, useDispatch } from '../../reducer';
import {
  CreateNftState,
  selectCollection
} from '../../reducer/slices/createNft';
import { getWalletAssetContractsQuery } from '../../reducer/async/queries';

interface CollectionRowProps {
  name: string;
  address: string;
  state: CreateNftState;
  dispatch: ReturnType<typeof useDispatch>;
}

function CollectionRow({ state, dispatch, name, address }: CollectionRowProps) {
  const selected = state.collectionAddress === address;
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
      onClick={() => dispatch(selectCollection(address))}
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
        <Text>{name[0]}</Text>
      </Flex>
      <Text
        color={selected ? 'white' : 'black'}
        pl={4}
        fontSize="md"
        fontWeight={selected ? '600' : 'normal'}
      >
        {name}
      </Text>
    </Flex>
  );
}

export default function CollectionSelect() {
  const { collections } = useSelector(s => s.collections);
  const state = useSelector(s => s.createNft);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getWalletAssetContractsQuery());
  }, [collections]);

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
      {Object.keys(collections).map(key => {
        const { address, metadata } = collections[key];
        return (
          <CollectionRow
            key={collections[key].address}
            name={metadata.name || address}
            address={address}
            dispatch={dispatch}
            state={state}
          />
        );
      })}
    </Flex>
  );
}
