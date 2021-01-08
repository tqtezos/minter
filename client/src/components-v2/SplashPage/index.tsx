import React from 'react';
import {
  Box,
  Flex,
  Text,
  Heading,
  Image,
  BoxProps,
  Link
} from '@chakra-ui/react';
import logo from './logo.svg';
import { useStyleConfig } from '@chakra-ui/react';

// Common Minter Components - Button & Link referencing branded variants

function MinterButton(props: BoxProps & { size?: string; variant?: string }) {
  const { size, variant, ...rest } = props;
  const styles = useStyleConfig('Button', { size, variant });
  return <Box as="button" sx={styles} {...rest} />;
}

function MinterLink(props: BoxProps & { size?: string; variant?: string }) {
  const { size, variant, ...rest } = props;
  const styles = useStyleConfig('Link', { size, variant });
  return <Box as="a" sx={styles} {...rest} />;
}

export default function SplashPage() {
  return (
    <Flex bg="brand.background" pos="absolute" w="100%" h="100%">
      <Flex
        align="center"
        justifyContent="space-between"
        width="100%"
        flexDir="column"
      >
        <Flex flexDir="column" align="center" maxW="600px" pt={20}>
          <Image src={logo} maxW="200px" pb={40} />
          <Heading color="white" size="xl" pb={8}>
            Create NFTs on Tezos
          </Heading>
          <Heading color="white" size="md" textAlign="center" pb={12}>
            Create and mint a new non-fungible token by using our simple
            interface. Just connect your Tezos account.
          </Heading>
          <Flex minW="400px" alignItems="stretch" pb={20}>
            <MinterButton variant="secondaryAction">
              Connect your wallet
            </MinterButton>
            <MinterLink variant="primaryAction" marginLeft={4} flex="1">
              Create
            </MinterLink>
          </Flex>
          <Text color="brand.lightGray">
            Learn more about <Link textDecor="underline">TZIP-12</Link>
          </Text>
        </Flex>
        <Flex
          width="100%"
          bg="brand.darkGray"
          color="brand.lightGray"
          paddingX={10}
          paddingY={4}
          justifyContent="space-between"
        >
          <Text fontSize="xs">
            &copy; OpenMinter, Inc. All rights reserved. Currently v1.0.0-beta1.
          </Text>
          <Flex>
            <Link fontSize="xs" textDecor="underline">
              Terms
            </Link>
            <Link fontSize="xs" textDecor="underline" ml={4}>
              Privacy Policy
            </Link>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
}
