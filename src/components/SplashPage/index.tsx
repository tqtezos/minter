import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Flex, Text, Heading, Image, Link } from '@chakra-ui/react';
import { MinterButton /* , MinterLink */ } from '../common';
import logo from '../common/assets/splash-logo.svg';
import { useSelector, useDispatch } from '../../reducer';
import { connectWallet } from '../../reducer/async/wallet';

export default function SplashPage() {
  const [, setLocation] = useLocation();
  const system = useSelector(s => s.system);
  const dispatch = useDispatch();

  useEffect(() => {
    if (system.status === 'WalletConnected') {
      setLocation('/collections');
    }
  }, [system.status, setLocation]);

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
        <Image src={logo} maxW="200px" pb={40} />
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
    </Flex>
  );
}
