import React, { useEffect } from 'react';
import { Flex } from '@chakra-ui/react';
import { useLocation } from 'wouter';
import Sidebar from './Sidebar';
import CollectionDisplay from './CollectionDisplay';
import { useSelector, useDispatch } from '../../../reducer';
import { getWalletAssetContractsQuery } from '../../../reducer/async/queries';
import { selectCollection } from '../../../reducer/slices/collections';

export default function Catalog() {
  const [, setLocation] = useLocation();
  const system = useSelector(s => s.system);
  const collections = useSelector(s => s.collections);
  const dispatch = useDispatch();

  useEffect(() => {
    if (collections.selectedCollection === null) {
      dispatch(selectCollection(collections.globalCollection));
    }
  }, [collections.selectedCollection, collections.globalCollection, dispatch]);

  useEffect(() => {
    if (system.status !== 'WalletConnected') {
      setLocation('/', { replace: true });
    } else {
      dispatch(getWalletAssetContractsQuery());
    }
  }, [system.status, setLocation, dispatch]);

  const selectedCollection = collections.selectedCollection;
  if (system.status !== 'WalletConnected' || !selectedCollection) {
    return null;
  }

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
      <CollectionDisplay address={selectedCollection} />
    </Flex>
  );
}
