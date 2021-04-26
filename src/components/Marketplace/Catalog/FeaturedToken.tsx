import React from 'react';
import { Token } from '../../../reducer/slices/collections';
import { useLocation } from 'wouter';
import { IpfsGatewayConfig } from '../../../lib/util/ipfs';
import {
  Box,
  Container,
  Flex,
  Spacer,
  Text,
  Heading,
  Stack
} from '@chakra-ui/react';
import { MinterButton } from '../../common';
import { TokenMedia } from '../../common/TokenMedia';

interface FeaturedTokenProps extends Token {
  config: IpfsGatewayConfig;
}

export default function FeaturedToken(props: FeaturedTokenProps) {
  const [, setLocation] = useLocation();
  return (
    <Container maxW="100%" py={10} px={0}>
      <Stack width="100%" direction={{ base: 'column', md: 'row' }} spacing="24px" mb={10} display="flex" flexDir="row" flexWrap="wrap" justifyContent="center" alignItems="center">
        <Flex pr={[0, 10]} borderRight={["unset", "2px solid #666"]} justifyContent="center">
          <TokenMedia
            maxW="90%"
            class="featured"
            {...props}
          />
        </Flex>
        <Box pl={[0, 10]} marginLeft="0 !important">
          <Flex flexDir="column" h="100%" w="100%">
            <Heading size="md" mt={4} fontSize="2.5rem">
              {props.title}
            </Heading>
            <Text fontSize="sm" fontWeight="600" color="gray.500">
              {props.description}
            </Text>
            <Spacer />
            <br />
            <Text fontSize="md">
              Current Price:{' '}
              <Text as="span" fontWeight="600">
                {props.sale?.price} ꜩ
              </Text>
            </Text>
            <MinterButton
              size="md"
              variant="primaryAction"
              w="150px"
              my={4}
              onClick={e => {
                e.preventDefault();
                setLocation(`/collection/${props.address}/token/${props.id}`, {
                  replace: false
                });
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
