import React, { useEffect } from 'react';
import {
  Flex,
  Heading,
  Link,
  SimpleGrid,
  Spinner,
  Text,
  Image
} from '@chakra-ui/react';
import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react';
import { MinterButton } from '../common';
import { ExternalLink, Wind } from 'react-feather';
import { useDispatch, useSelector } from '../../reducer';
import {
  getContractNftsQuery,
  getNftAssetContractQuery
} from '../../reducer/async/queries';
import TokenCard from '../common/TokenCard';
import CollectionsDropdown from '../Collections/Catalog/CollectionsDropdown';

interface CollectionDisplayProps {
  address: string | null;
  ownedOnly?: boolean;
}

export default function CreatorDisplay({
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

  const tokens = collection.tokens;

  console.log(tokens);

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
      {wallet !== null ? (
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
        marginBottom={2}
      >
        <Flex flexDir="column" width="100%">
          <Flex justify="space-between" width="100%">
            <Heading size="lg">{collection.metadata.name || ''}</Heading>
          </Flex>
          <Flex align="center" display={{ base: 'none', md: 'flex' }}>
            <Image
              src={`https://services.tzkt.io/v1/avatars2/${collection.address}`}
            />
            <Text fontFamily="mono" color="brand.lightGray">
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
                    owner === tzPublicKey &&
                    (metadata?.creators?.find(creator => creator === owner) ||
                      metadata?.minter === owner)
                )
                .map(token => {
                  console.log(token);
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
          </TabPanel>
          <TabPanel>
            <SimpleGrid columns={{ sm: 1, md: 2, lg: 3, xl: 4 }} gap={8} pb={8}>
              {tokens
                .filter(
                  ({ owner, metadata }) =>
                    owner === tzPublicKey &&
                    !metadata?.creators?.find(creator => creator === owner) &&
                    metadata?.minter !== owner
                )
                .map(token => {
                  console.log(token);
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
          </TabPanel>
          <TabPanel>
            <SimpleGrid columns={{ sm: 1, md: 2, lg: 3, xl: 4 }} gap={8} pb={8}>
              {tokens
                .filter(({ sale }) => sale?.seller === tzPublicKey)
                .map(token => {
                  console.log(token);
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
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Flex>
  );
}
