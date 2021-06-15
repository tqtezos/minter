import React, { useEffect } from 'react';
import {
  Flex,
  Heading,
  SimpleGrid,
  Spinner,
  Text,
  Image,
  Box,
  Link
} from '@chakra-ui/react';
import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react';
import { ChevronLeft, Wind } from 'react-feather';
import { useDispatch, useSelector } from '../../reducer';
import {
  getContractNftsQuery,
  getNftAssetContractQuery
} from '../../reducer/async/queries';
import TokenCard from '../common/TokenCard';
import { Collection } from '../../reducer/slices/collections';
import { MinterButton } from '../common';
import lk from '../common/assets/link-icon.svg'

interface CreatorDisplay404Props {
  ownedOnly: boolean;
}

function CreatorDisplay404(props: CreatorDisplay404Props) {
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
          {props.ownedOnly ? 'No owned tokens to display' : 'No tokens to display'}
        </Text>
      </Flex>
    </Flex>
  );
}

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
  const { config } = useSelector(s => s.system);
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
    return (
      <CreatorDisplay404 ownedOnly={ownedOnly} />
    );
  }

  const collection = collections[selectedCollection];
  if (!collection) {
    return (
      <CreatorDisplay404 ownedOnly={ownedOnly} />
    );
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
    return (
      <CreatorDisplay404 ownedOnly={ownedOnly} />
    );
  }

  const tokens = collection.tokens;

  if (tokens.length === 0) {
    return (
      <CreatorDisplay404 ownedOnly={ownedOnly} />
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
        <Flex align="center" overflow="hidden">
          <Image width="5rem"
            src={`https://services.tzkt.io/v1/avatars2/${collection.address}`}
          />
          <Link display="block" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis" href={`https://${(config.network + '.').replace('mainnet.', '')}tzkt.io/${minter}`}>
            <Heading fontSize="1.5rem" overflow="hidden" textOverflow="ellipsis" overflowWrap="normal">{minter}&nbsp;<sup><img src={lk} alt="" width="auto" height="auto" style={{ display: 'inline-block' }} /></sup></Heading>
          </Link>
        </Flex>
      </Flex>

      <Flex
        flexDir="column"
        h="100%"
        w="100%"
        px={{ base: 6, md: 10 }}
        flex="1"
      >
        <Tabs>
          <TabList>
            <Tab>Minted</Tab>
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
    </Flex>
  );
}
