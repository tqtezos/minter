import React from 'react';
import { useLocation } from 'wouter';
import {
  Box,
  Flex,
  Image,
  Link,
  Text,
  Menu,
  MenuButton,
  MenuList
} from '@chakra-ui/react';
import { Plus, Settings } from 'react-feather';
import { RiStore2Line } from 'react-icons/ri';
// import { IoCubeOutline } from 'react-icons/io5';
import { MdCollections } from 'react-icons/md';
import headerLogo from './assets/header-logo.svg';
import { useSelector, useDispatch } from '../../reducer';
import { disconnectWallet } from '../../reducer/async/wallet';
import { MinterButton } from '.';
import logo from './assets/splash-logo.svg';

interface HeaderLinkProps {
  to: string;
  children: React.ReactNode;
}

function HeaderLink(props: HeaderLinkProps) {
  const [location, setLocation] = useLocation();
  const selected = location === props.to;
  return (
    <Link
      href={props.to}
      onClick={e => {
        e.preventDefault();
        setLocation(props.to);
      }}
      textDecor="none"
      borderRadius="10px"
      alignItems="center"
      fontWeight="600"
      px={3}
      py={2}
      ml={4}
      bg={selected ? 'gray.700' : 'none'}
      color={selected ? 'gray.400' : 'gray.200'}
      display="flex"
      transition="none"
      _hover={{
        textDecor: 'none',
        bg: 'gray.700',
        color: selected ? 'gray.400' : 'gray.100'
      }}
    >
      {props.children}
    </Link>
  );
}

function WalletInfo(props: { tzPublicKey: string }) {
  return (
    <Flex flexDir="row" align="center" my={4}>
      <Box borderRadius="100%" width={10} height={10} bg="brand.darkGray" p={1}>
        <Image
          src={`https://services.tzkt.io/v1/avatars2/${props.tzPublicKey}`}
        />
      </Box>
      <Text fontFamily="mono" ml={2}>
        {props.tzPublicKey}
      </Text>
    </Flex>
  );
}

function WalletDisplay() {
  const [, setLocation] = useLocation();
  const system = useSelector(s => s.system);
  const dispatch = useDispatch();
  if (system.status !== 'WalletConnected') {
    return null;
  }
  return (
    <>
      <Menu placement="bottom-end" offset={[4, 24]}>
        <MenuButton>
          <Settings />
        </MenuButton>
        <MenuList color="brand.black">
          <Flex flexDir="column" px={4} py={2}>
            <Text fontSize={16} fontWeight="600">
              Network: {system.config.network}
            </Text>
            <WalletInfo tzPublicKey={system.tzPublicKey} />
            <MinterButton
              alignSelf="flex-start"
              variant="cancelAction"
              onClick={async () => {
                await dispatch(disconnectWallet());
                setLocation('/');
              }}
            >
              Disconnect
            </MinterButton>
          </Flex>
        </MenuList>
      </Menu>
    </>
  );
}

export function Header() {
  const [location, setLocation] = useLocation();
  if (location === '/' || location === '') {
    return null;
  }
  return (
    <Flex
      width="100%"
      bg="brand.black"
      paddingX={4}
      paddingY={3}
      alignItems="center"
      justifyContent="space-between"
    >
      <Image
        display={{
          base: 'none',
          md: 'block'
        }}
        maxH="28px"
        marginTop="4px"
        src={logo}
        onClick={e => {
          e.preventDefault();
          setLocation('/collections');
        }}
        cursor="pointer"
      />
      <Image
        display={{
          base: 'block',
          md: 'none'
        }}
        maxW="38px"
        src={headerLogo}
        onClick={e => {
          e.preventDefault();
          setLocation('/collections');
        }}
        cursor="pointer"
      />
      <Flex flex="1" justify="flex-end">
        <HeaderLink to="/marketplace">
          <Box color="brand.turquoise">
            <RiStore2Line size={16} />
          </Box>
          <Text ml={2}>Marketplace</Text>
        </HeaderLink>
        <HeaderLink to="/collections">
          <Box color="brand.turquoise">
            <MdCollections size={16} />
          </Box>
          <Text ml={2}>Collections</Text>
        </HeaderLink>
        <HeaderLink to="/create">
          <Box color="brand.blue">
            <Plus size={16} strokeWidth="3" />
          </Box>
          <Text ml={2}>New Asset</Text>
        </HeaderLink>
        <Flex
          alignItems="center"
          color="brand.gray"
          paddingLeft={4}
          marginLeft={4}
          borderLeft="2px solid"
          borderColor="brand.darkGray"
        >
          <WalletDisplay />
        </Flex>
      </Flex>
    </Flex>
  );
}

export default Header;
