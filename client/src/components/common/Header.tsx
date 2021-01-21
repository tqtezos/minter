import React, { useContext } from 'react';
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
import { ChevronDown, Package, Plus } from 'react-feather';
import headerLogo from './assets/header-logo.svg';
import { SystemContext } from '../../context/system';
import { createAssetContract, mintToken } from '../../lib/nfts/actions';
import {
  getContractNfts,
  getWalletNftAssetContracts
} from '../../lib/nfts/queries';

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

function WalletDisplay() {
  const { system, disconnect } = useContext(SystemContext);
  const [, setLocation] = useLocation();
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
              await disconnect();
              setLocation('/');
            }}
          >
            Disconnect
          </MenuItem>
          <MenuItem
            onClick={async () => {
              const originOp = await createAssetContract(system, 'hello1');
              const contract = await originOp.contract();
              console.log(contract.address);
            }}
          >
            Test Contract Create
          </MenuItem>
          <MenuItem
            onClick={async () => {
              const contracts = await getWalletNftAssetContracts(system);
              console.log(contracts);
            }}
          >
            Test Get Wallet NFT Asset Contracts
          </MenuItem>
          <MenuItem
            onClick={async () => {
              const originOp = await mintToken(
                system,
                'KT1X8YZ3Xet9EtyEj77KZmS8WrHaNN16FET2',
                { hello: 'world2' }
              );
              await originOp.confirmation();
              console.log(originOp);
            }}
          >
            Test Mint Token
          </MenuItem>
          <MenuItem
            onClick={async () => {
              const nfts = await getContractNfts(
                system,
                'KT1X8YZ3Xet9EtyEj77KZmS8WrHaNN16FET2'
              );
              console.log(nfts);
            }}
          >
            Test Get NFTs
          </MenuItem>
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

export default Header;
