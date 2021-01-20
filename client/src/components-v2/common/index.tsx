import React, { useContext } from 'react';
import { useLocation } from 'wouter';
import {
  Box,
  Button,
  ButtonProps,
  Flex,
  Image,
  Link,
  LinkProps,
  Text,
  useStyleConfig,
  Menu,
  MenuButton,
  MenuList,
  MenuItem
} from '@chakra-ui/react';
import { ChevronDown, Package, Plus } from 'react-feather';
import headerLogo from './header-logo.svg';
import { SystemContext } from '../../systemContext';
import { createAssetContract, mintToken } from '../../lib/nfts/actions';
import { getContractNfts } from '../../lib/nfts/queries';

// Common Minter Components - Button & Link referencing branded variants

export function MinterButton(
  props: ButtonProps & { size?: string; variant?: string }
) {
  const { size, variant, ...rest } = props;
  const styles = useStyleConfig('Button', { size, variant });
  return <Button sx={styles} {...rest} />;
}

export function MinterLink(
  props: LinkProps & { size?: string; variant?: string }
) {
  const { size, variant, ...rest } = props;
  const styles = useStyleConfig('Link', { size, variant });
  return <Link sx={styles} {...rest} />;
}

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
    <>
      <Box borderRadius="100%" width={9} height={9} bg="brand.darkGray" />
      <Text fontFamily="mono" ml={4} mr={2}>
        {props.tzPublicKey}
      </Text>
    </>
  );
}

function WalletMenu(props: { disconnect: () => Promise<void> }) {
  const [, setLocation] = useLocation();
  return (
    <Menu placement="bottom-start">
      <MenuButton>
        <ChevronDown />
      </MenuButton>
      <MenuList color="brand.black">
        <MenuItem
          onClick={async () => {
            await props.disconnect();
            setLocation('/');
          }}
        >
          Disconnect
        </MenuItem>
      </MenuList>
    </Menu>
  );
}

function WalletDisplay() {
  const { system, connect, disconnect } = useContext(SystemContext);
  if (system.status !== 'WalletConnected') {
    connect();
    return null;
  }
  return (
    <>
      <WalletInfo tzPublicKey={system.tzPublicKey} />
      <WalletMenu disconnect={disconnect} />
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
      <Flex flex="1" alignItems="center" color="brand.lightGray">
        <WalletDisplay />
      </Flex>
      <Image
        maxW="38px"
        src={headerLogo}
        onClick={e => {
          e.preventDefault();
          setLocation('/assets');
        }}
        cursor="pointer"
      />
      <Flex flex="1" justify="end">
        <HeaderLink to="/assets">
          <Box color="brand.turquoise">
            <Package size={16} strokeWidth="3" />
          </Box>
          <Text ml={2}>Collections</Text>
        </HeaderLink>
        <HeaderLink to="/create-non-fungible">
          <Box color="brand.blue">
            <Plus size={16} strokeWidth="3" />
          </Box>
          <Text ml={2}>New Asset</Text>
        </HeaderLink>
      </Flex>
    </Flex>
  );
}
