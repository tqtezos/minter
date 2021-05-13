import React, { useEffect, useState } from 'react';
import {
  Flex,
  Heading,
  Link,
  SimpleGrid,
  Spinner,
  Text,
  Image,
  Menu,
  MenuList,
  MenuOptionGroup,
  MenuItemOption
} from '@chakra-ui/react';
import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react';
import { ExternalLink, Wind } from 'react-feather';
import { useDispatch, useSelector } from '../../reducer';
import {
  getContractNftsQuery,
  getNftAssetContractQuery
} from '../../reducer/async/queries';
import TokenCard from '../common/TokenCard';
import { Collection } from '../../reducer/slices/collections';

interface CreatorDisplayProps {
  minter: string;
  collections: { [key: string]: Collection };
  ownedOnly?: boolean;
}

export default function CreatorDisplay({
  minter,
  collections,
  ownedOnly = true
}: CreatorDisplayProps) {
  const system = useSelector(s => s.system);
  const { config } = useSelector(s => s.system);
  const [obj, setObj] = useState('');
  const dispatch = useDispatch();
  let selectedCollection = Object.keys(collections)[0];

  useEffect(() => {
    if (selectedCollection) {
      dispatch(getNftAssetContractQuery(selectedCollection)).then(() =>
        dispatch(getContractNftsQuery(selectedCollection))
      );
    }
  }, [dispatch, selectedCollection]);

  if (!selectedCollection) {
    return <></>;
  }

  const collection = collections[selectedCollection];
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

  const tokens = collection.tokens;

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
      px={{ base: 6, md: 10 }}
      pt={6}
      flex="1"
      bg="brand.brightGray"
      borderLeftWidth="1px"
      borderLeftColor="brand.lightBlue"
      overflowY="scroll"
      justify="start"
    >
      <Menu>
        <MenuList>
          <MenuOptionGroup type="radio" defaultValue={obj || ''}>
            <Text ml={4} my={2} fontWeight="600">
              Collections
            </Text>
            {Object.keys(collections).map((address, idx) => (
              <MenuItemOption
                key={address + idx}
                value={address}
                selected={address === obj}
                onClick={() => setObj(address)}
              >
                {collections[address].metadata.name}
              </MenuItemOption>
            ))}
          </MenuOptionGroup>
        </MenuList>
      </Menu>
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
        marginBottom={2}
      >
        <Flex flexDir="column" width="100%">
          <Flex align="center" display={{ base: 'none', md: 'flex' }}>
            <Image
              src={`https://services.tzkt.io/v1/avatars2/${collection.address}`}
            />
            <Link
              color="brand.darkGray"
              display="block"
              whiteSpace="nowrap"
              overflow="hidden"
              textOverflow="ellipsis"
              href={`https://${(system.config.network + '.').replace(
                'mainnet.',
                ''
              )}tzkt.io/${collection.address}`}
            >
              <Heading>{collection.address}</Heading>
            </Link>
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
      </Flex>
      <Tabs>
        <TabList>
          <Tab>Minted</Tab>
          <Tab>Collected</Tab>
          <Tab>For Sale</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <SimpleGrid columns={{ sm: 1, md: 2, lg: 3, xl: 4 }} gap={8} pb={8}>
              {tokens
                .filter(
                  ({ owner, metadata }) =>
                    owner === minter &&
                    (metadata?.creators?.find(creator => creator === owner) ||
                      metadata?.minter === owner)
                )
                .map(token => {
                  return (
                    <TokenCard
                      key={collection.address + token.id}
                      address={collection.address}
                      config={config}
                      {...token}
                    />
                  );
                })}
            </SimpleGrid>
          </TabPanel>
          <TabPanel>
            <SimpleGrid columns={{ sm: 1, md: 2, lg: 3, xl: 4 }} gap={8} pb={8}>
              {tokens
                .filter(
                  ({ owner, metadata }) =>
                    owner === minter &&
                    !metadata?.creators?.find(creator => creator === owner) &&
                    metadata?.minter !== owner
                )
                .map(token => {
                  return (
                    <TokenCard
                      key={collection.address + token.id}
                      address={collection.address}
                      config={config}
                      {...token}
                    />
                  );
                })}
            </SimpleGrid>
          </TabPanel>
          <TabPanel>
            <SimpleGrid columns={{ sm: 1, md: 2, lg: 3, xl: 4 }} gap={8} pb={8}>
              {tokens
                .filter(({ sale }) => sale?.seller === minter)
                .map(token => {
                  return (
                    <TokenCard
                      key={collection.address + token.id}
                      address={collection.address}
                      config={config}
                      {...token}
                    />
                  );
                })}
            </SimpleGrid>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Flex>
  );
}
