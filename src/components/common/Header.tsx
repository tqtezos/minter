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
  MenuList,
  MenuItem
} from '@chakra-ui/react';
import { ChevronDown, Package, Plus, Share2 } from 'react-feather';
import headerLogo from './assets/header-logo.svg';
import { useSelector, useDispatch } from '../../reducer';
import { disconnectWallet } from '../../reducer/async/wallet';

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

function HeaderBadge(props: { children: React.ReactNode }) {
  return (
    <Box
      textDecor="none"
      borderRadius="10px"
      alignItems="center"
      fontWeight="600"
      px={3}
      py={2}
      ml={4}
      bg="blue.900"
      color="brand.lightGray"
      display="flex"
      transition="none"
    >
      {props.children}
    </Box>
  );
}

function WalletInfo(props: { tzPublicKey: string }) {
  return (
    <>
      <Box borderRadius="100%" width={10} height={10} bg="brand.darkGray" p={1}>
        <Image
          src={`https://services.tzkt.io/v1/avatars2/${props.tzPublicKey}`}
        />
      </Box>
      <Text fontFamily="mono" ml={4} mr={2}>
        {props.tzPublicKey}
      </Text>
    </>
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
      <WalletInfo tzPublicKey={system.tzPublicKey} />
      <Menu placement="bottom-start">
        <MenuButton>
          <ChevronDown />
        </MenuButton>
        <MenuList color="brand.black">
          <MenuItem
            onClick={async () => {
              await dispatch(disconnectWallet());
              setLocation('/');
            }}
          >
            Disconnect
          </MenuItem>
        </MenuList>
      </Menu>
    </>
  );
}

export function Header() {
  const [location, setLocation] = useLocation();
  const system = useSelector(s => s.system);
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
      <Flex flex="1" alignItems="center" color="brand.lightGray">
        <WalletDisplay />
      </Flex>
      <Image
        maxW="38px"
        src={headerLogo}
        onClick={e => {
          e.preventDefault();
          setLocation('/collections');
        }}
        cursor="pointer"
      />
      <Flex flex="1" justify="flex-end">

        {system.config.network !== "mainnet" ? (
          <HeaderBadge>
            <Box color="brand.lightGray">
              <Share2 size={16} strokeWidth="3" />
            </Box>
            <Text ml={2}>Edonet</Text>
          </HeaderBadge>
        ) : null}

        <HeaderLink to="/collections">
          <Box color="brand.turquoise">
            <Package size={16} strokeWidth="3" />
          </Box>
          <Text ml={2}>Collections</Text>
        </HeaderLink>
        <HeaderLink to="/create">
          <Box color="brand.blue">
            <Plus size={16} strokeWidth="3" />
          </Box>
          <Text ml={2}>New Asset</Text>
        </HeaderLink>
      </Flex>
    </Flex>
  );
}

export default Header;
