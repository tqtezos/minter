import React, { Dispatch, SetStateAction, useReducer, useState } from 'react';
import { useLocation } from 'wouter';
import { Box, Flex, Grid, Heading, Image, Link, Text } from '@chakra-ui/react';
import { Plus } from 'react-feather';
import { Header, MinterButton } from '../common';
import placeholderAsset from '../common/placeholder_asset.png';
import { RefreshCw } from 'react-feather';

interface Token {
  id: number;
  title: string;
  owner: string;
  description: string;
  ipfs_hash: string;
  metadata: Record<string, string>;
}

interface Collection {
  name?: string;
  address: string;
  owner: string;
}

interface State {
  selectedCollection: string | null | undefined;
  collections: Collection[];
  tokens: Record<string, Token[]>;
}

const initialState: State = {
  selectedCollection: 'foo',
  collections: [
    {
      name: 'Minter',
      address: 'foo',
      owner: 'tz1...'
    },
    {
      name: 'Digital Art',
      address: 'bar',
      owner: 'tz1YPSCGWXwBdTncK2aCctSZAXWvGsGwVJqU'
    },
    {
      name: 'Game Rewards',
      address: 'baz',
      owner: 'tz1YPSCGWXwBdTncK2aCctSZAXWvGsGwVJqU'
    }
  ],
  tokens: {
    foo: [
      {
        id: 0,
        title: 'Cool Token',
        owner: 'tz1YPSCGWXwBdTncK2aCctSZAXWvGsGwVJqU',
        description: '',
        ipfs_hash: '...',
        metadata: {
          // Use CSS filter metadata for placeholder display distinction
          // TODO: Remove once real images are pulled from IPFS
          filter: ''
        }
      },
      {
        id: 1,
        title: 'Another Cool Token',
        owner: 'tz1YPSCGWXwBdTncK2aCctSZAXWvGsGwVJqU',
        description: '',
        ipfs_hash: '...',
        metadata: {
          filter: 'saturate(20)'
        }
      }
    ],
    bar: [
      {
        id: 0,
        title: 'Title 2',
        owner: 'tz1YPSCGWXwBdTncK2aCctSZAXWvGsGwVJqU',
        description: 'hello',
        ipfs_hash: '...',
        metadata: {
          filter: 'grayscale()'
        }
      }
    ],
    baz: [
      {
        id: 0,
        title: 'Title 3',
        owner: 'other_owner',
        description: 'hello',
        ipfs_hash: '...',
        metadata: {
          filter: 'grayscale()'
        }
      }
    ]
  }
};

type Action = { type: 'select_collection'; payload: { address: string } };

function reducer(state: State, action: Action) {
  switch (action.type) {
    case 'select_collection': {
      return { ...state, selectedCollection: action.payload.address };
    }
    default: {
      return state;
    }
  }
}

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

interface TokenTileProps extends Token {
  selectedCollection: string;
}

function TokenTile(props: TokenTileProps) {
  const [, setLocation] = useLocation();
  return (
    <Flex
      w="100%"
      h="300px"
      bg="white"
      flexDir="column"
      border="1px solid"
      borderColor="brand.lightBlue"
      borderRadius="3px"
      overflow="hidden"
      boxShadow="0px 0px 0px 4px rgba(15, 97, 255, 0)"
      transition="all linear 50ms"
      _hover={{
        cursor: 'pointer',
        boxShadow: '0px 0px 0px 4px rgba(15, 97, 255, 0.1)'
      }}
      onClick={() =>
        setLocation(`/asset-details/${props.selectedCollection}/${props.id}`)
      }
    >
      <Image
        src={placeholderAsset}
        objectFit="cover"
        flex="1"
        filter={props.metadata?.filter}
      />
      <Flex
        width="100%"
        px={4}
        py={4}
        bg="white"
        borderTop="1px solid"
        borderColor="brand.lightBlue"
      >
        <Text>{props.title}</Text>
      </Flex>
    </Flex>
  );
}

const WALLET_ADDRESS = 'tz1YPSCGWXwBdTncK2aCctSZAXWvGsGwVJqU';

export default function AssetsPage() {
  const [, setLocation] = useLocation();
  const [state, dispatch] = useReducer(reducer, initialState);

  const featuredCollections = state.collections.filter(coll => {
    return coll.owner !== WALLET_ADDRESS;
  });
  const ownedCollections = state.collections.filter(coll => {
    return coll.owner === WALLET_ADDRESS;
  });

  const tokens = state.selectedCollection
    ? state.tokens[state.selectedCollection]
    : [];
  const ownedTokens = tokens.filter(({ owner }) => owner === WALLET_ADDRESS);

  return (
    <Flex flex="1" w="100%" minHeight="0">
      <Flex w="250px" h="100%" flexDir="column">
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
          <MinterButton variant="primaryActionInverted">
            <Box color="currentcolor">
              <Plus size={16} strokeWidth="3" />
            </Box>
            <Text ml={2}>New Collection</Text>
          </MinterButton>
        </Flex>
      </Flex>
      <Flex
        flexDir="column"
        h="100%"
        w="100%"
        px={10}
        pt={6}
        flex="1"
        bg="brand.brightGray"
        borderLeftWidth="1px"
        borderLeftColor="brand.lightBlue"
        overflowY="scroll"
        justify="start"
      >
        <Flex w="100%" pb={6} justify="space-between" align="center">
          <Heading size="lg">
            {
              state.collections.find(
                ({ address }) => address === state.selectedCollection
              )?.name
            }
          </Heading>
          <MinterButton variant="primaryActionInverted">
            <Box color="currentcolor">
              <RefreshCw size={16} strokeWidth="3" />
            </Box>
            <Text ml={2}>Refresh</Text>
          </MinterButton>
        </Flex>
        <Grid templateColumns="repeat(4, 1fr)" gap={8} pb={8}>
          {state.selectedCollection
            ? ownedTokens.map(token => {
                return (
                  <TokenTile
                    key={token.id}
                    selectedCollection={state.selectedCollection || ''}
                    {...token}
                  />
                );
              })
            : null}
        </Grid>
      </Flex>
    </Flex>
  );
}
