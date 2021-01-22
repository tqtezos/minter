import React from 'react';
import { useLocation } from 'wouter';
import { Flex, Grid, Image, Text } from '@chakra-ui/react';
import { Token, State } from '../reducer';
import placeholderAsset from '../../common/assets/placeholder_asset.png';
import { Wind } from 'react-feather';

interface TokenTileProps extends Token {
  selectedCollection: string;
}

function TokenTile(props: TokenTileProps) {
  const [, setLocation] = useLocation();
  return (
    <Flex
      w="100%"
      h="300px"
      bg="white"
      flexDir="column"
      border="1px solid"
      borderColor="brand.lightBlue"
      borderRadius="3px"
      overflow="hidden"
      boxShadow="0px 0px 0px 4px rgba(15, 97, 255, 0)"
      transition="all linear 50ms"
      _hover={{
        cursor: 'pointer',
        boxShadow: '0px 0px 0px 4px rgba(15, 97, 255, 0.1)'
      }}
      onClick={() =>
        setLocation(`/asset-details/${props.selectedCollection}/${props.id}`)
      }
    >
      <Image
        src={placeholderAsset}
        objectFit="cover"
        flex="1"
        filter={props.metadata?.filter}
      />
      <Flex
        width="100%"
        px={4}
        py={4}
        bg="white"
        borderTop="1px solid"
        borderColor="brand.lightBlue"
      >
        <Text>{props.title}</Text>
      </Flex>
    </Flex>
  );
}

interface TokenGridProps {
  state: State;
  walletAddress: string;
}

export default function TokenGrid({ state, walletAddress }: TokenGridProps) {
  const selectedCollection = state.selectedCollection;

  if (selectedCollection === null) {
    return <></>;
  }

  const collection = state.collections[selectedCollection];

  if (!collection) {
    return <></>;
  }

  const selectedTokens = collection.tokens || [];

  const tokens = selectedTokens.filter(({ owner }) => owner === walletAddress);

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
    <Grid templateColumns="repeat(4, 1fr)" gap={8} pb={8}>
      {tokens.map(token => {
        return (
          <TokenTile
            key={token.id}
            selectedCollection={selectedCollection}
            {...token}
          />
        );
      })}
    </Grid>
  );
}
