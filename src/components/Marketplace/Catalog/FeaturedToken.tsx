import React from 'react';
import { Token } from '../../../reducer/slices/collections';
import { useLocation } from 'wouter';
import { ipfsUriToGatewayUrl } from '../../../lib/util/ipfs';
import { AspectRatio, Box, Container, Flex, Spacer, Text, Heading, Stack } from '@chakra-ui/react';
import { MinterButton } from '../../common';
import { TokenMedia } from '../../common/TokenMedia';

interface FeaturedTokenProps extends Token {
  network: string;
}

export default function FeaturedToken(props: FeaturedTokenProps) {
  const [, setLocation] = useLocation();
  return (
    <Container maxW="65em" py={10}>
      <Stack direction={{sm: "column", md: "row"}} spacing="24px" mb={10}>
        <Box w="400px" h="266px">
          <AspectRatio maxW="400px" maxH="266px" ratio={2 / 3}>
            <TokenMedia
              src={ipfsUriToGatewayUrl(props.network, props.artifactUri)}
            />
          </AspectRatio>
        </Box>
        <Box>
          <Flex flexDir="column" h="100%" w="100%">
          <Heading size="md" mt={4}>{props.title}</Heading>
          <Heading size="sm" my={4} color="brand.darkGray">Seller: {props.sale?.seller}</Heading>
          <Text fontSize="sm" fontWeight="600" color="gray.500">{props.description}</Text>
          <Spacer />
          <Text fontSize="md">Current Price: <Text as="span" fontWeight="600">{props.sale?.price} ꜩ</Text></Text>
          <MinterButton
            size="md"
            variant="primaryAction"
            w="150px"
            my={4}
            onClick={e => {
              e.preventDefault();
              setLocation(`/collection/${props.address}/token/${props.id}`, { replace: false });
            }}
          >
            <Text>View</Text>
          </MinterButton>
          </Flex>
        </Box>
      </Stack>
    </Container>
  );
}
