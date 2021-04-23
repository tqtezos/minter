import React from 'react';
import { Token } from '../../../reducer/slices/collections';
import { useLocation } from 'wouter';
import { ipfsUriToGatewayUrl } from '../../../lib/util/ipfs';
import {
  Box,
  Container,
  Flex,
  Spacer,
  Text,
  Heading,
  Stack
} from '@chakra-ui/react';
import { TokenMedia } from '../../common/TokenMedia';

interface FeaturedTokenProps extends Token {
  network: string;
}

export default function FeaturedToken(props: FeaturedTokenProps) {
  const [, setLocation] = useLocation();
  return (
    <Container maxW="100%" py={10} px={0}>
      <Stack width="100%" direction={{ base: 'column', md: 'row' }} spacing="24px" mb={10} display="flex" flexDir="row" flexWrap="wrap" justifyContent="center" alignItems="center"
        onClick={e => {
          e.preventDefault();
          setLocation(`/collection/${props.address}/token/${props.id}`, {
            replace: false
          });
        }}>
          <Flex paddingRight={[0, 10]} borderRight={['', '2px solid #aaa']} justifyContent="flex-end">
          <TokenMedia
            src={ipfsUriToGatewayUrl(props.network, props.artifactUri)}
            height="auto"
            maxW="60vw"
            maxH="60vh"
          />
          </Flex>
        <Box pl={[0, 10]} marginLeft="0 !important">
          <Flex flexDir="column" h="100%" w="100%">
            <Heading size="lg" mt={4} fontSize="2.5rem">
              {props.title}
            </Heading>
            <Heading size="sm" my={4} color="brand.darkGray">
              {props.title}
            </Heading>
            <Heading size="sm" my={4} color="brand.darkGray">
              Seller: {props.sale?.seller}
            </Heading>
            <Text fontSize="sm" fontWeight="600" color="gray.500">
              {props.description}
            </Text>
            <Spacer />
            <Text fontSize="md">
              Current Price:{' '}
              <Text as="span" fontWeight="600">
                {props.sale?.price} ꜩ
              </Text>
            </Text>
          </Flex>
        </Box>
      </Stack>
    </Container>
  );
}