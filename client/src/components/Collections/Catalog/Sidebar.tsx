import React from 'react';
import { Flex, Heading, Text } from '@chakra-ui/react';
import { CreateCollectionButton } from '../../common/CreateCollection';
import { State, Action, Collection } from '../reducer';

interface CollectionTabProps extends Collection {
  selected: boolean;
  dispatch: React.Dispatch<Action>;
}

function CollectionTab({
  name,
  address,
  selected,
  dispatch
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
      onClick={() =>
        dispatch({ type: 'select_collection', payload: { address } })
      }
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
        <Text>{name ? name[0] : '?'}</Text>
      </Flex>
      <Text pl={4} fontWeight={selected ? '600' : '600'}>
        {name}
      </Text>
    </Flex>
  );
}

interface SidebarProps {
  state: State;
  dispatch: React.Dispatch<Action>;
}

const WALLET_ADDRESS = 'tz1YPSCGWXwBdTncK2aCctSZAXWvGsGwVJqU';

export default function Sidebar({ state, dispatch }: SidebarProps) {
  const featuredCollections = state.collections.filter(coll => {
    return coll.owner !== WALLET_ADDRESS;
  });

  const ownedCollections = state.collections.filter(coll => {
    return coll.owner === WALLET_ADDRESS;
  });

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
      {featuredCollections.map(coll => (
        <CollectionTab
          key={coll.address}
          selected={coll.address === state.selectedCollection}
          dispatch={dispatch}
          {...coll}
        />
      ))}
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
      {ownedCollections.map(coll => (
        <CollectionTab
          key={coll.address}
          selected={coll.address === state.selectedCollection}
          dispatch={dispatch}
          {...coll}
        />
      ))}
      <Flex px={2} pt={2} justify="center">
        <CreateCollectionButton />
      </Flex>
    </>
  );
}
