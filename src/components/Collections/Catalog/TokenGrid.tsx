import React from 'react';
import { Flex, SimpleGrid, Text } from '@chakra-ui/react';
import { Wind } from 'react-feather';
import { CollectionsState } from '../../../reducer/slices/collections';
import { useSelector } from '../../../reducer';
import TokenCard from '../../common/TokenCard';

interface TokenGridProps {
  state: CollectionsState;
  walletAddress: string;
}

export default function TokenGrid({ state, walletAddress }: TokenGridProps) {
  const network = useSelector(s => s.system.config.network);
  const selectedCollection = state.selectedCollection;

  if (selectedCollection === null) {
    return <></>;
  }

  const collection = state.collections[selectedCollection];

  if (!collection || collection.tokens === null) {
    return <></>;
  }

  const tokens = collection.tokens.filter(
    ({ owner, sale }) => owner === walletAddress || sale?.seller === walletAddress
  );

  if (tokens.length === 0) {
    return (
      <Flex w="100%" flex="1" flexDir="column" align="center">
        <Flex
          px={20}
          py={10}
          bg="gray.200"
          textAlign="center"
          align="center"
          borderRadius="5px"
          flexDir="column"
          fontSize="xl"
          color="gray.400"
          mt={28}
        >
          <Wind />
          <Text fontWeight="600" pt={5}>
            No owned tokens to display in this collection
          </Text>
        </Flex>
      </Flex>
    );
  }

  return (
    <SimpleGrid columns={{ sm: 1, md: 2, lg: 3, xl: 4 }} gap={8} pb={8}>
      {tokens.map(token => {
        return (
          <TokenCard
          key={`${token.address}-${token.id}`}
          network={network}
          {...token}
          address={selectedCollection}
        />
        );
      })}
    </SimpleGrid>
  );
}
