import React, { useEffect } from 'react';
import { Flex } from '@chakra-ui/react';
import config from '../../config.json';

import { useSelector, useDispatch } from '../../reducer';
import {
  getWalletAssetContractsQuery,
  getContractNftsQuery
} from '../../reducer/async/queries';

export default function Profile() {
  const { system, collections: state } = useSelector(s => s);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getWalletAssetContractsQuery());
  }, [dispatch]);

  useEffect(() => {
    const keys = Object.keys(state.collections);
    if (keys.length > 1) {
      keys.forEach(contract => {
        if (
          !state.collections[contract].loaded &&
          contract !== config.contracts.nftFaucet
        )
          dispatch(getContractNftsQuery(contract));
      });
    }
  }, [dispatch, state, system]);

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
      {JSON.stringify(
        Object.values(state.collections)
          .map(collection => collection.tokens)
          .reduce((previous, current) => [
            ...(previous ?? []),
            ...(current ?? [])
          ])
      )}
    </Flex>
  );
}
