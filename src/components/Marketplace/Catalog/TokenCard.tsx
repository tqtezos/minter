import React from 'react';
import { Token } from '../../../reducer/slices/collections';
import { useLocation } from 'wouter';
import { IpfsGatewayConfig } from '../../../lib/util/ipfs';
import { AspectRatio, Box, Flex } from '@chakra-ui/react';
import { TokenMedia } from '../../common/TokenMedia';
import tz from '../../common/assets/tezos-sym.svg'

interface TokenCardProps extends Token {
  config: IpfsGatewayConfig;
}

export default function TokenCard(props: TokenCardProps) {
  const [, setLocation] = useLocation();
  return (
    <Flex
      position="relative"
      flexDir="column"
      ratio={1}
      w="100%"
      bg="white"
      border="1px solid"
      borderColor="#eee"
      borderRadius="0px"
      overflow="hidden"
      boxShadow="none"
      transition="all linear 50ms"
      _hover={{
        cursor: 'pointer',
        boxShadow: '0px 0px 10px #3339',
      }}
      onClick={() =>
        setLocation(`/collection/${props.address}/token/${props.id}`)
      }
    >
      <AspectRatio ratio={3 / 2}>
        <Box>
          <TokenMedia {...props} />
        </Box>
      </AspectRatio>
      <Flex
        width="100%"
        px={4}
        py={4}
        bg="white"
        borderTop="1px solid"
        borderColor="brand.lightBlue"
        flexDir="row"
        justifyContent="space-between"
      >
        <Flex display="block" fontSize="md" width="70%" alignItems="center" height="100%" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">{props.title}</Flex>
        <Flex fontSize="md" fontWeight="600" width="30%" justifyContent="flex-end" alignItems="center">
          {props.sale?.price} <img src={tz} alt="" width={10} height="auto" style={{ display: 'inline-block' }} />
        </Flex>
      </Flex>
    </Flex>
  );
}