import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Flex, Text, Heading, Image, Link } from '@chakra-ui/react';
import { MinterButton /* , MinterLink */ } from '../common';
import logo from './logo.svg';
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
  }, [system.status]);

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
        <Heading
          color="white"
          size="md"
          textAlign="center"
          pb={12}
          opacity=".8"
        >
          Create and mint a new non-fungible token by using our simple
          interface. Just connect your Tezos account.
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
          {/* <MinterLink */}
          {/*   variant="primaryAction" */}
          {/*   marginLeft={4} */}
          {/*   flex="1" */}
          {/*   href="/create-non-fungible" */}
          {/*   onClick={e => { */}
          {/*     e.preventDefault(); */}
          {/*     setLocation('/create-non-fungible'); */}
          {/*   }} */}
          {/* > */}
          {/*   Create */}
          {/* </MinterLink> */}
        </Flex>
        {/* <Text fontFamily="mono" fontSize="xs" color="brand.lightGray"> */}
        {/*   Learn more about <Link textDecor="underline">TZIP-12</Link> */}
        {/* </Text> */}
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
        <Text fontSize="xs">OpenMinter Version v0.1</Text>
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
