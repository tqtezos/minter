import React from 'react';
import { Flex, SimpleGrid } from '@chakra-ui/react';
import { useSelector } from '../../../reducer';
import TokenCard from '../../common/TokenCard';
import { getMarketplaceNfts } from '../../../lib/nfts/queries';

export default function Catalog() {
  const { system, marketplace: state } = useSelector(s => s);
  let nfts: any
  (async() => {
  nfts = await getMarketplaceNfts(system, state.marketplace.address);
  })();

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
          {nfts?.map((nft: any, index: number) => {
            return (
              <TokenCard
                key={`${nft.address}-${nft.id}`}
                network={system.config.network}
                {...nft}
                index={index}
              />
            );
          })}
        </SimpleGrid>
      </>
    </Flex>
  );
}