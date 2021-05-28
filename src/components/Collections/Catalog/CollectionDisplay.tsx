import React, { useEffect } from 'react';
import {
  Box,
  Flex,
  Heading,
  Link,
  SimpleGrid,
  Spinner,
  Text
} from '@chakra-ui/react';
import { MinterButton } from '../../common';
import { ChevronLeft, ExternalLink, Wind } from 'react-feather';
import { useDispatch, useSelector } from '../../../reducer';
import {
  getContractNftsQuery,
  getNftAssetContractQuery
} from '../../../reducer/async/queries';
import CollectionsDropdown from './CollectionsDropdown';
import TokenCard from '../../common/TokenCard';

interface CollectionDisplayProps {
  address: string | null;
  ownedOnly?: boolean;
}

export default function CollectionDisplay({
  address,
  ownedOnly = true
}: CollectionDisplayProps) {
  const collections = useSelector(s => s.collections);
  const { config, tzPublicKey, wallet } = useSelector(s => s.system);
  const dispatch = useDispatch();

  useEffect(() => {
    if (address !== null) {
      dispatch(getNftAssetContractQuery(address)).then(() =>
        dispatch(getContractNftsQuery(address))
      );
    }
  }, [address, dispatch]);

  if (address === null) {
    return <></>;
  }

  const collection = collections.collections[address];

  if (!collection) {
    return <></>;
  }

  if (!collection.loaded) {
    return (
      <Flex flexDir="column" align="center" flex="1" pt={20}>
        <Spinner size="xl" mb={6} color="gray.300" />
        <Heading size="lg" textAlign="center" color="gray.500">
          Loading...
        </Heading>
      </Flex>
    );
  }

  if (collection.tokens === null) {
    return <></>;
  }

  const tokens = ownedOnly
    ? collection.tokens.filter(
        ({ owner, sale }) =>
          owner === tzPublicKey || sale?.seller === tzPublicKey
      )
    : collection.tokens;

  if (tokens.length === 0) {
    return (
      <Flex w="100%" flex="1" flexDir="column" align="center">
        <Flex
          px={20}
          py={10}
          bg="gray.200"
          textAlign="center"
          align="center"
          borderRadius="5px"
          flexDir="column"
          fontSize="xl"
          color="gray.400"
          mt={28}
        >
          <Wind />
          <Text fontWeight="600" pt={5}>
            {ownedOnly
              ? 'No owned tokens to display in this collection'
              : 'No tokens to display in this collection'}
          </Text>
        </Flex>
      </Flex>
    );
  }

  return (
    <Flex
      flexDir="column"
      h="100%"
      w="100%"
      flex="1"
      bg="brand.brightGray"
      borderLeftWidth="1px"
      borderLeftColor="brand.lightBlue"
      overflowY="scroll"
      justify="start"
    >
      <Flex flexDir="row">
        <Flex justifyContent="flex-start" width="4rem">
          <MinterButton
            variant="primaryActionInverted"
            onClick={e => {
              e.preventDefault();
              window.history.back();
            }}
          >
            <Box color="currentcolor">
              <ChevronLeft size={24} strokeWidth="3" />
            </Box>
          </MinterButton>
        </Flex>

        <Flex
            flexDir="column"
            px={{ base: 6, md: 10 }}
            pt={6}
            overflow="hidden"
        >
          {ownedOnly && wallet !== null ? (
            <Flex display={{ base: 'flex', md: 'none' }} mb={4}>
              <CollectionsDropdown />
            </Flex>
          ) : null}
          <Flex
            w="100%"
            pb={6}
            justify="space-between"
            align={{
              base: 'flex-start',
              md: 'center'
            }}
            flexDir={{
              base: 'column',
              md: 'row'
            }}
          >
            <Flex flexDir="column" width="100%">
              <Flex justify="space-between" width="100%">
                <Heading size="lg">{collection.metadata.name || ''}</Heading>
              </Flex>
              <Flex align="center">
                <Text 
                  fontFamily="mono" 
                  color="brand.lightGray"
                  overflow="hidden"
                  textOverflow="ellipsis"
                  overflowWrap="normal"
                >
                  {collection.address}
                </Text>
                <Link
                  href={`${config.bcd.gui}/${config.network}/${collection.address}`}
                  color="brand.darkGray"
                  isExternal
                  ml={2}
                >
                  <ExternalLink size={16} />
                </Link>
              </Flex>
            </Flex>
            <MinterButton
              display={{ base: 'none', md: 'flex' }}
              variant="primaryActionInverted"
              onClick={() => {
                const selectedCollection = collections.selectedCollection;
                if (selectedCollection !== null) {
                  dispatch(getContractNftsQuery(selectedCollection));
                }
              }}
              mt={{
                base: 4,
                md: 0
              }}
            ></MinterButton>
          </Flex>
        </Flex>
      </Flex>
      <SimpleGrid columns={{ sm: 1, md: 2, lg: 3, xl: 4 }} gap={8} px={{ base: 6, md: 10 }} pb={8}>
        {tokens.map(token => {
          return (
            <TokenCard
              key={address + token.id}
              address={address}
              config={config}
              {...token}
            />
          );
        })}
      </SimpleGrid>
    </Flex>
  );
}
