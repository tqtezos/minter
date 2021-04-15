import React, {useState } from 'react';
import { useLocation } from 'wouter';
import { AspectRatio, Box, Flex, SimpleGrid, Text, Heading } from '@chakra-ui/react';
import { Wind } from 'react-feather';
import { Token, CollectionsState } from '../../../reducer/slices/collections';
import { ipfsUriToGatewayUrl } from '../../../lib/util/ipfs';
import { useSelector } from '../../../reducer';
import { TokenMedia } from '../../common/TokenMedia';
import { getAverageRGB } from '../../Marketplace/Catalog/TokenCard';

interface TokenTileProps extends Token {
  network: string;
  selectedCollection: string;
}

function TokenTile(props: TokenTileProps) {
  const [, setLocation] = useLocation();
  const [obj, setObj] = useState<{ r: number, g: number, b: number }>({ r: 255, g: 255, b: 255 });
  const src = ipfsUriToGatewayUrl(props.network, props.artifactUri);
  return (
    <Flex
      position="relative"
      role="group"
      flexDir="column"
      ratio={1}
      w="100%"
      background={`rgb(${obj.r},${obj.g},${obj.b})`}
      border="2px solid"
      borderColor="#fff"
      borderRadius="3px"
      overflow="hidden"
      boxShadow="0px 0px 10px #3333"
      transition="all linear 50ms"
      _hover={{
        cursor: 'pointer',
        boxShadow: '0px 0px 0px 4px rgba(15, 97, 255, 0.1)'
      }}
      onClick={() =>
        setLocation(`/collection/${props.address}/token/${props.id}`)
      }
    >
      <AspectRatio ratio={3 / 2}>
        <Box p={4}>
          <TokenMedia
            src={src}
            onLoad={async (url: string, type: string) => {
              let rgb = await getAverageRGB(url, type) as any;
              setObj(rgb);
            }}
          />
        </Box>
      </AspectRatio>
      <Flex
        opacity="0"
        width="100%"
        bg="#191919d9"
        borderTop="1px solid"
        borderColor="#fff"
        flexDir="column"
        flexWrap="nowrap"
        justifyContent="space-evenly"
        alignItems="center"
        height="100%"
        bottom="0"
        borderTopRightRadius="2px"
        borderTopLeftRadius="2px"
        _groupHover={{ opacity: 1 }}
        position="absolute"
        transition="0.25s all"
      >
        <Heading size="lg" color="white">{props.title}</Heading>
      </Flex>
    </Flex>
  );
}

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
          <TokenTile
            key={token.id}
            selectedCollection={selectedCollection}
            network={network}
            {...token}
          />
        );
      })}
    </SimpleGrid>
  );
}
