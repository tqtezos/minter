import React from 'react';
import { useLocation } from 'wouter';
import { Box, Flex, Grid, Heading, Image, Link, Text } from '@chakra-ui/react';
import { Plus } from 'react-feather';
import { Header, MinterButton } from '../common';
import placeholderAsset from '../common/placeholder_asset.png';
import { RefreshCw } from 'react-feather';

interface CollectionTabProps {
  selected: boolean;
  name: string;
  address: string;
}

function CollectionTab({ selected, name }: CollectionTabProps) {
  return (
    <Flex
      align="center"
      py={2}
      px={4}
      bg={selected ? 'gray.100' : 'white'}
      color={selected ? 'black' : 'gray.600'}
      _hover={{
        cursor: 'pointer',
        color: selected ? 'black' : 'gray.800'
      }}
      onClick={() => null}
      role="group"
    >
      <Flex
        align="center"
        justify="center"
        w={8}
        h={8}
        bg={selected ? 'brand.blue' : 'gray.100'}
        color={selected ? 'white' : 'gray.400'}
        borderRadius="100%"
        fontWeight="600"
        _groupHover={{
          bg: selected ? 'brand.blue' : 'gray.200'
        }}
      >
        <Text>{name[0]}</Text>
      </Flex>
      <Text pl={4} fontWeight={selected ? '600' : '600'}>
        {name}
      </Text>
    </Flex>
  );
}

export default function AssetsPage() {
  const [, setLocation] = useLocation();
  return (
    <Flex pos="absolute" w="100%" h="100%">
      <Flex justifyContent="space-between" width="100%" flexDir="column">
        <Header />
        <Flex flex="1" w="100%" minHeight="0">
          <Flex w="250px" h="100%" flexDir="column">
            <Heading px={4} pt={6} pb={4} size="md" color="brand.darkGray">
              Collections
            </Heading>
            <Heading
              fontFamily="mono"
              px={4}
              pb={2}
              fontSize="sm"
              color="brand.darkGray"
            >
              Featured
            </Heading>
            <CollectionTab
              key="1"
              selected={true}
              name="Minter"
              address="abc"
            />
            <Heading
              fontFamily="mono"
              px={4}
              pt={4}
              pb={2}
              fontSize="sm"
              color="brand.darkGray"
            >
              Your Collections
            </Heading>
            <CollectionTab
              key="2"
              selected={false}
              name="Paintings"
              address="def"
            />
            <CollectionTab
              key="3"
              selected={false}
              name="Illustrations"
              address="ghi"
            />
            <Flex px={2} pt={2} justify="center">
              <MinterButton variant="primaryActionInverted">
                <Box color="currentcolor">
                  <Plus size={16} strokeWidth="3" />
                </Box>
                <Text ml={2}>New Collection</Text>
              </MinterButton>
            </Flex>
          </Flex>
          <Flex
            flexDir="column"
            h="100%"
            w="100%"
            px={10}
            pt={6}
            flex="1"
            bg="brand.brightGray"
            borderLeftWidth="1px"
            borderLeftColor="brand.lightBlue"
            overflowY="scroll"
            justify="start"
          >
            <Flex
              w="100%"
              flex="1"
              pb={6}
              justify="space-between"
              align="center"
            >
              <Heading size="lg">Minter</Heading>
              <MinterButton variant="primaryActionInverted">
                <Box color="currentcolor">
                  <RefreshCw size={16} strokeWidth="3" />
                </Box>
                <Text ml={2}>Refresh</Text>
              </MinterButton>
            </Flex>
            <Grid templateColumns="repeat(4, 1fr)" gap={8} pb={8}>
              {[...new Array(10)].map(_x => {
                return (
                  <Flex
                    w="100%"
                    h="300px"
                    bg="white"
                    flexDir="column"
                    border="1px solid"
                    borderColor="brand.lightBlue"
                    borderRadius="3px"
                    overflow="hidden"
                    boxShadow="0px 0px 0px 4px rgba(15, 97, 255, 0)"
                    transition="all linear 50ms"
                    _hover={{
                      cursor: 'pointer',
                      boxShadow: '0px 0px 0px 4px rgba(15, 97, 255, 0.1)'
                    }}
                    onClick={() => setLocation('/asset-details/abc/0')}
                  >
                    <Image src={placeholderAsset} objectFit="cover" flex="1" />
                    <Flex
                      width="100%"
                      px={4}
                      py={4}
                      bg="white"
                      borderTop="1px solid"
                      borderColor="brand.lightBlue"
                    >
                      <Text>Title</Text>
                    </Flex>
                  </Flex>
                );
              })}
            </Grid>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
}
