import Notifications from '../components/common/Notifications';
import React, { useEffect } from 'react';
import { Flex, Text, Heading, Image, Link } from '@chakra-ui/react';
import { MinterButton /* , MinterLink */ } from '../components/common';
import { useSelector, useDispatch } from '../reducer';
import { connectWallet, reconnectWallet } from '../reducer/async/wallet';
import router from 'next/router';

function Root() {
  const system = useSelector(s => s.system);
  const dispatch = useDispatch();
  const walletReconnectAttempted = useSelector(
    s => s.system.walletReconnectAttempted
  );

  useEffect(() => {
    if (system.status === 'WalletConnected') {
      router.push('/collections');
    }
  }, [system.status, router]);

  return (
    <Flex
      align="center"
      justifyContent="space-between"
      w="100%"
      flex="1"
      flexDir="column"
      bg="brand.background"
    >
      <Flex flexDir="column" align="center" maxW="600px" pt={20}>
        <Image src="/splash-logo.svg" maxW="200px" pb={40} />
        <Heading color="white" size="xl" pb={8}>
          Create NFTs on Tezos
        </Heading>
        <Flex minW="400px" justify="center" pb={20}>
          <MinterButton
            variant="secondaryActionLined"
            onClick={e => {
              e.preventDefault();
              dispatch(connectWallet());
            }}
          >
            Connect your wallet
          </MinterButton>
        </Flex>
      </Flex>
      <Flex
        width="100%"
        bg="brand.darkGray"
        color="brand.lightGray"
        fontFamily="mono"
        paddingX={10}
        paddingY={4}
        justifyContent="space-between"
      >
        <Text fontSize="xs">
          OpenMinter Version v{process.env.REACT_APP_VERSION}
        </Text>
        <Flex>
          <Link
            fontSize="xs"
            textDecor="underline"
            href="https://github.com/tqtezos/minter"
          >
            GitHub
          </Link>
        </Flex>
      </Flex>
      <Notifications />
    </Flex>
  );
}

export default function RootWrapper() {

  return (
    <Root />
  )
}