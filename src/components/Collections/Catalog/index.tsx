import React, { useEffect } from 'react';
import { Flex } from '@chakra-ui/react';
import CollectionsDisplay from './CollectionsDisplay';
import { useSelector, useDispatch } from '../../../reducer';
import {
  getWalletAssetContractsQuery,
  getNftAssetContractQuery
} from '../../../reducer/async/queries';
import { selectCollection } from '../../../reducer/slices/collections';
import Sidebar from './Sidebar';

export default function Catalog() {
  const system = useSelector(s => s.system);
  const collections = useSelector(s => s.collections);
  const dispatch = useDispatch();

  const globalCollection =
    collections.collections[collections.globalCollection];

  useEffect(() => {
    if (!globalCollection) {
      dispatch(getNftAssetContractQuery(collections.globalCollection));
      return;
    }
    if (collections.selectedCollection === null) {
      dispatch(selectCollection(collections.globalCollection));
      return;
    }
  }, [
    globalCollection,
    collections.selectedCollection,
    collections.globalCollection,
    dispatch
  ]);

  useEffect(() => {
    if (system.status === 'WalletConnected') {
      dispatch(getWalletAssetContractsQuery());
    }
  }, [system.status, dispatch]);

  const selectedCollection = collections.selectedCollection;

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
        overflowY="scroll"
        display={{
          base: 'none',
          md: 'flex'
        }}
      >
        <Sidebar />
      </Flex>
      <CollectionsDisplay address={selectedCollection} />
    </Flex>
  );
}
