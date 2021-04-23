import React from 'react';
import { Token } from '../../../reducer/slices/collections';
import { useLocation } from 'wouter';
import { ipfsUriToGatewayUrl } from '../../../lib/util/ipfs';
import { AspectRatio, Box, Flex, Text, Heading } from '@chakra-ui/react';
import { TokenMedia } from '../../common/TokenMedia';

interface TokenCardProps extends Token {
  network: string;
}

export default function TokenCard(props: TokenCardProps) {
  const [, setLocation] = useLocation();
  return (
    <Flex
      flexDir="column"
      ratio={1}
      w="100%"
      bg="white"
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
        setLocation(`/collection/${props.address}/token/${props.id}`)
      }
    >
      <AspectRatio ratio={3 / 2}>
        <Box>
          <TokenMedia
            src={ipfsUriToGatewayUrl(props.network, props.artifactUri)}
          />
        </Box>
      </AspectRatio>
      <Flex
        width="100%"
        px={4}
        py={4}
        bg="white"
        borderTop="1px solid"
        borderColor="brand.lightBlue"
        flexDir="column"
      >
        <Heading size="sm">{props.title}</Heading>
      </Flex>
      <Flex
        px={2}
        py={4}
        mx={2}
        bg="white"
        borderTop="1px solid"
        borderColor="brand.lightGray"
        justify="space-between"
      >
        <Text fontSize="md">Current Price</Text>
        <Text fontSize="md" fontWeight="600">{props.sale?.price} ꜩ</Text>
      </Flex>
    </Flex>
  );
}
