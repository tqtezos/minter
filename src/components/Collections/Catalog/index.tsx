import React, { useEffect, useRef, useState } from 'react';
import { Box, Flex, Heading, Text } from '@chakra-ui/react';
import { useLocation } from 'wouter';
import { RefreshCw } from 'react-feather';
import { MinterButton } from '../../common';
import Sidebar from './Sidebar';
import TokenGrid from './TokenGrid';

import { useSelector, useDispatch } from '../../../reducer';
import {
  getContractNftsQuery,
  getWalletAssetContractsQuery
} from '../../../reducer/async/queries';
import { selectCollection } from '../../../reducer/slices/collections';

export default function Catalog() {
  const [, setLocation] = useLocation();
  const { system, collections: state } = useSelector(s => s);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [lastRequest, setLastRequest] = useState([{}]);

  let currentCollection = useRef(state.collections[state.globalCollection]);

  useEffect(() => {
    if (state.selectedCollection)
      currentCollection.current = state.collections[state.selectedCollection];
    else currentCollection.current = state.collections[state.globalCollection];
  }, [state.selectedCollection, state.collections, state.globalCollection]);

  useEffect(() => {
    const selectedCollection = state.selectedCollection;

    if (!currentCollection.current.tokens) {
      if (selectedCollection === null) {
        dispatch(selectCollection(state.globalCollection));
      } else if (state.selectedCollection !== state.globalCollection) {
        dispatch(
          getContractNftsQuery({
            collection: currentCollection.current,
            purge: false
          })
        ).then(({ payload }) => {
          if (payload && 'tokens' in payload) setLastRequest(payload.tokens);
        });
      }
    }
  }, [
    system.status,
    state.selectedCollection,
    state.globalCollection,
    dispatch,
    currentCollection
  ]);

  useEffect(() => {
    if (system.status !== 'WalletConnected') {
      setLocation('/', { replace: true });
    } else {
      dispatch(getWalletAssetContractsQuery());
    }
  }, [system.status, setLocation, dispatch]);

  const selectedCollection = state.selectedCollection;
  if (system.status !== 'WalletConnected' || !selectedCollection) {
    return null;
  }

  const collection = state.collections[selectedCollection];

  return (
    <Flex flex="1" w="100%" minHeight="0">
      <Flex w="250px" h="100%" flexDir="column" overflowY="scroll">
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
        onScroll={e => {
          const overflowY =
            e.currentTarget.scrollHeight - window.innerHeight - 10;
          if (
            e.currentTarget.scrollTop >= overflowY &&
            !loading &&
            lastRequest.length > 0
          ) {
            dispatch(
              getContractNftsQuery({
                collection: currentCollection.current,
                purge: false
              })
            ).then(({ payload }) => {
              if (payload && 'tokens' in payload)
                setLastRequest(payload.tokens);
              setLoading(false);
            });
            setLoading(true);
          }
        }}
      >
        <Flex w="100%" pb={6} justify="space-between" align="center">
          <Flex flexDir="column">
            <Heading size="lg">{collection.metadata.name || ''}</Heading>
            <Text fontFamily="mono" color="brand.lightGray">
              {collection.address}
            </Text>
          </Flex>
          <MinterButton
            variant="primaryActionInverted"
            onClick={() => {
              const selectedCollection = state.selectedCollection;
              if (selectedCollection !== null) {
                dispatch(
                  getContractNftsQuery({
                    collection: currentCollection.current,
                    purge: true
                  })
                );
              }
            }}
          >
            <Box color="currentcolor">
              <RefreshCw size={16} strokeWidth="3" />
            </Box>
            <Text ml={2}>Refresh</Text>
          </MinterButton>
        </Flex>
        <TokenGrid state={state} walletAddress={system.tzPublicKey} />
      </Flex>
    </Flex>
  );
}
