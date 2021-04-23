import React, { useEffect } from 'react';
import { Flex, SimpleGrid } from '@chakra-ui/react';
import { useDispatch, useSelector } from '../../../reducer';
import TokenCard from '../../common/TokenCard';
import { getMarketplaceNftsQuery } from '../../../reducer/async/queries';

export default function Catalog() {
  const { system, marketplace: state } = useSelector(s => s);
  let dispatch = useDispatch();
  dispatch(getMarketplaceNftsQuery(state.marketplace.address));
  useEffect(() => {
  }, [dispatch, state.marketplace.address, system]);

  return (
    <Flex
      w="100%"
      h="100%"
      bg="brand.brightGray"
      pt={6}
      overflowY="scroll"
      justify="start"
      flexDir="column"
      alignItems="center"
    >
      <>
        <SimpleGrid columns={{ sm: 1, md: 2, lg: 3, xl: 4 }} gap={8} pb={8}>
          {console.log(state.marketplace)}
          {state.marketplace.tokens?.map((nft: any, index: number) => {
            return (
              <TokenCard
                nft={nft}
                network={system.config.network}
                index={index}
              />
            );
          })}
        </SimpleGrid>
      </>
    </Flex>
  );
}