import React, { useEffect } from 'react';
import { Box, Flex, Heading, Text, Link, Spinner, Image } from '@chakra-ui/react';
import { useLocation } from 'wouter';
import { RefreshCw, ExternalLink } from 'react-feather';
import { MinterButton } from '../../common';
import Sidebar from './Sidebar';
import TokenGrid from './TokenGrid';
import CollectionsDropdown from './CollectionsDropdown';
import logo from '../../common/assets/splash-logo.svg';

import { useSelector, useDispatch } from '../../../reducer';
import {
  getContractNftsQuery,
  getWalletAssetContractsQuery
} from '../../../reducer/async/queries';
import { selectCollection } from '../../../reducer/slices/collections';
import { connectWallet } from '../../../reducer/async/wallet';

export default function Catalog() {
  const [, setLocation] = useLocation();
  const { system, collections: state } = useSelector(s => s);
  const dispatch = useDispatch();

  useEffect(() => {
    const selectedCollection = state.selectedCollection;
    if (selectedCollection === null) {
      dispatch(selectCollection(state.globalCollection));
    } else {
      dispatch(getContractNftsQuery(selectedCollection));
    }
  }, [
    system.status,
    state.selectedCollection,
    state.globalCollection,
    dispatch
  ]);

  useEffect(() => {
    if (system.status === 'WalletConnected') {
      dispatch(getWalletAssetContractsQuery());
    }
  }, [system.status, setLocation, dispatch]);

  const selectedCollection = state.selectedCollection;
  if (system.status !== 'WalletConnected' || !selectedCollection) {
    return (<Flex
      align="center"
      justifyContent="space-between"
      w="100%"
      flex="1"
      flexDir="column"
      bg="brand.background"
    >
      <Flex flexDir="column" align="center" maxW="600px" pt={20}>
        <Image src={logo} maxW="200px" pb={40} />
        <Heading color="white" size="xl" pb={8}>
          Create NFTs on Tezos
        </Heading>
        <Flex minW="400px" justify="center" pb={20}>
          <MinterButton
            variant="secondaryActionLined"
            onClick={e => {
              e.preventDefault();
              dispatch(connectWallet());
            }}
          >
            Connect your wallet
          </MinterButton>
        </Flex>
      </Flex>
      <Flex
        width="100%"
        bg="brand.darkGray"
        color="brand.lightGray"
        fontFamily="mono"
        paddingX={10}
        paddingY={4}
        justifyContent="space-between"
      >
        <Text fontSize="xs">
          OpenMinter Version v{process.env.REACT_APP_VERSION}
        </Text>
        <Flex>
          <Link
            fontSize="xs"
            textDecor="underline"
            href="https://github.com/tqtezos/minter"
          >
            GitHub
          </Link>
        </Flex>
      </Flex>
    </Flex>);
  }

  const collection = state.collections[selectedCollection];

  return (
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
        overflowY="auto"
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
        px={{ base: 6, md: 10 }}
        pt={6}
        flex="1"
        bg="brand.brightGray"
        borderLeftWidth="2px"
        borderLeftColor="#aaa"
        overflowY="auto"
        justify="start"
      >
        <Flex display={{ base: 'flex', md: 'none' }} mb={4}>
          <CollectionsDropdown />
        </Flex>
        <Flex
          display={{ base: 'none', md: 'flex' }}
          w="100%"
          pb={6}
          mb={6}
          borderBottom="2px solid #aaa"
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
            </Flex>
            <Flex align="center">
              <Text fontFamily="mono" color="brand.lightGray">
                {`${collection.address}`}
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
                dispatch(getContractNftsQuery(selectedCollection));
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
  );
}
