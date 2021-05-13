import React, { useEffect } from 'react';
import { Flex } from '@chakra-ui/react';
import CreatorDisplay from './CreatorDisplay';
import { useSelector, useDispatch } from '../../reducer';
import {
  getWalletAssetContractsQuery,
  getAssetContractsQuery
} from '../../reducer/async/queries';
import { Collection } from '../../reducer/slices/collections';

export default function Creator({ minter }: { minter: string }) {
  const system = useSelector(s => s.system);
  const collections = useSelector(s => s.collections);
  const dispatch = useDispatch();

  useEffect(() => {
    if (system.status === 'WalletConnected' && !minter) {
      dispatch(getWalletAssetContractsQuery());
    } else if(!!minter) {
      dispatch(getAssetContractsQuery(minter));
    }
  }, [system.status, dispatch, minter]);

  const creatorsCollections = {} as { [key: string]: Collection };
  Object.keys(collections.collections).filter(key => collections.collections[key].creator.address === (minter ?? system.tzPublicKey)).map(addr => {creatorsCollections[addr] = collections.collections[addr]; return null; });
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
      <CreatorDisplay minter={minter} collections={creatorsCollections} />
    </Flex>
  );
}
