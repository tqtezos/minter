import React from 'react';
import { Flex, Heading, Text } from '@chakra-ui/react';
import { CreateCollectionButton } from '../../common/modals/CreateCollection';
import { useSelector, useDispatch } from '../../../reducer';
import {
  selectCollection,
  Collection
} from '../../../reducer/slices/collections';

interface CollectionTabProps extends Collection {
  selected: boolean;
  onSelect: (address: string) => void;
}

function CollectionTab({
  address,
  metadata,
  selected,
  onSelect
}: CollectionTabProps) {
  return (
    <Flex
      align="center"
      py={2}
      px={4}
      bg={selected ? 'gray.100' : 'white'}
      color={selected ? 'black' : 'gray.600'}
      _hover={{
        cursor: 'pointer',
        color: selected ? 'black' : 'gray.800'
      }}
      onClick={() => onSelect(address)}
      role="group"
    >
      <Flex
        align="center"
        justify="center"
        w={8}
        h={8}
        bg={selected ? 'brand.blue' : 'gray.100'}
        color={selected ? 'white' : 'gray.400'}
        borderRadius="100%"
        fontWeight="600"
        _groupHover={{
          bg: selected ? 'brand.blue' : 'gray.200'
        }}
      >
        <Text>{metadata?.name ? metadata.name[0] : '?'}</Text>
      </Flex>
      <Text pl={4} fontWeight={selected ? '600' : '600'}>
        {metadata?.name || address}
      </Text>
    </Flex>
  );
}

export default function Sidebar() {
  const state = useSelector(s => s.collections);
  const dispatch = useDispatch();
  return (
    <>
      <Heading px={4} pt={6} pb={4} size="md" color="brand.darkGray">
        Collections
      </Heading>
      <Heading
        fontFamily="mono"
        px={4}
        pb={2}
        fontSize="sm"
        color="brand.darkGray"
      >
        Featured
      </Heading>
      <CollectionTab
        key={state.globalCollection}
        selected={state.globalCollection === state.selectedCollection}
        onSelect={address => dispatch(selectCollection(address))}
        {...state.collections[state.globalCollection]}
      />
      <Heading
        fontFamily="mono"
        px={4}
        pt={4}
        pb={2}
        fontSize="sm"
        color="brand.darkGray"
      >
        Your Collections
      </Heading>
      {Object.keys(state.collections)
        .filter(address => address !== state.globalCollection)
        .map(address => (
          <CollectionTab
            key={address}
            selected={address === state.selectedCollection}
            onSelect={address => dispatch(selectCollection(address))}
            {...state.collections[address]}
          />
        ))}
      <Flex px={2} pt={4} justify="center" pb={8}>
        <CreateCollectionButton sync={false} />
      </Flex>
    </>
  );
}
