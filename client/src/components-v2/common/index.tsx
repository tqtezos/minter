import React from 'react';
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
  useStyleConfig
} from '@chakra-ui/react';
import { ChevronDown, Plus } from 'react-feather';
import headerLogo from './header-logo.svg';

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

export function Header(props: { action?: React.ReactNode }) {
  const [, setLocation] = useLocation();
  return (
    <Flex
      width="100%"
      bg="brand.black"
      paddingX={4}
      paddingY={3}
      alignItems="center"
      justifyContent="space-between"
    >
      <Flex alignItems="center" color="brand.lightGray" flex="1">
        <Box borderRadius="100%" width={9} height={9} bg="brand.darkGray" />
        <Text fontFamily="mono" marginLeft={4}>
          {'tz1YPSCGWXwBdTncK2aCctSZAXWvGsGwVJqU'.slice(0, 16) + '...'}
        </Text>
        <ChevronDown />
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
        {props.action ? (
          props.action
        ) : (
          <MinterLink
            variant="primaryAction"
            href="/create-non-fungible"
            onClick={e => {
              e.preventDefault();
              setLocation('/create-non-fungible');
            }}
          >
            <Box color="currentcolor">
              <Plus size={16} strokeWidth="3" />
            </Box>
            <Text ml={2}>New Asset</Text>
          </MinterLink>
        )}
      </Flex>
    </Flex>
  );
}
