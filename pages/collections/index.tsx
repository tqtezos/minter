import React, { useEffect } from 'react';
import { Box, Flex, Heading, Text, Link, Spinner } from '@chakra-ui/react';
import { RefreshCw, ExternalLink } from 'react-feather';
import { MinterButton } from '../../src/components/common';
import Sidebar from '../../src/components/Collections/Catalog/Sidebar';
import TokenGrid from '../../src/components/Collections/Catalog/TokenGrid';
import CollectionsDropdown from '../../src/components/Collections/Catalog/CollectionsDropdown';
import { useRouter } from 'next/router';
import { store } from '../../src/reducer';

import { useSelector, useDispatch } from '../../src/reducer';
import {
  getContractNftsQuery,
  getWalletAssetContractsQuery
} from '../../src/reducer/async/queries';
import { selectCollection } from '../../src/reducer/slices/collections';
import { Provider } from 'react-redux';
import { AnyAction } from 'redux';

export default function Catalog() {
  const router = useRouter();
  const { system, collections: state } = useSelector(s => s);
  const dispatch = useDispatch();

  useEffect(() => {
    const selectedCollection = state.selectedCollection;
    if (selectedCollection === null) {
      dispatch(selectCollection(state.globalCollection));
    } else {
      dispatch(getContractNftsQuery(selectedCollection) as unknown as AnyAction);
    }
  }, [
    system.status,
    state.selectedCollection,
    state.globalCollection,
    dispatch
  ]);

  useEffect(() => {
    if (system.status !== 'WalletConnected') {
      router.push('/');
    } else {
      dispatch(getWalletAssetContractsQuery() as unknown as AnyAction);
    }
  }, [system.status, dispatch, router]);

  const selectedCollection = state.selectedCollection;
  if (system.status !== 'WalletConnected' || !selectedCollection) {
    return null;
  }

  const collection = state.collections[selectedCollection];

  return (
    <Provider store={store}>
    <Flex
      flex="1"
      w="100%"
      minHeight="0"
      flexDir={{
        base: 'column',
        md: 'row'
      }}
    >
      <Flex
        w="250px"
        h="100%"
        flexDir="column"
        overflowY="scroll"
        display={{
          base: 'none',
          md: 'flex'
        }}
      >
        <Sidebar />
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
        <Flex
          w="100%"
          pb={6}
          justify="space-between"
          align={{
            base: 'flex-start',
            md: 'center'
          }}
          flexDir={{
            base: 'column',
            md: 'row'
          }}
        >
          <Flex flexDir="column" width="100%">
            <Flex justify="space-between" width="100%">
              <Heading size="lg">{collection.metadata.name || ''}</Heading>
              <Flex display={{ base: 'flex', md: 'none' }}>
                <CollectionsDropdown />
              </Flex>
            </Flex>
            <Flex align="center">
              <Text fontFamily="mono" color="brand.lightGray">
                {collection.address}
              </Text>
              <Link
                href={system.config.bcd.gui + '/' + collection.address}
                color="brand.darkGray"
                isExternal
                ml={2}
              >
                <ExternalLink size={16} />
              </Link>
            </Flex>
          </Flex>
          <MinterButton
            variant="primaryActionInverted"
            onClick={() => {
              const selectedCollection = state.selectedCollection;
              if (selectedCollection !== null) {
                dispatch(getContractNftsQuery(selectedCollection) as unknown as AnyAction);
              }
            }}
            mt={{
              base: 4,
              md: 0
            }}
          >
            <Box color="currentcolor">
              <RefreshCw size={16} strokeWidth="3" />
            </Box>
            <Text ml={2}>Refresh</Text>
          </MinterButton>
        </Flex>
        {!collection.loaded ? (
          <Flex flexDir="column" align="center" flex="1" pt={20}>
            <Spinner size="xl" mb={6} color="gray.300" />
            <Heading size="lg" textAlign="center" color="gray.500">
              Loading...
            </Heading>
          </Flex>
        ) : (
          <TokenGrid state={state} walletAddress={system.tzPublicKey} />
        )}
      </Flex>
    </Flex>
    </Provider>
  );
}
