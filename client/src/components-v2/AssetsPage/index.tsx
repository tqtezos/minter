import React from 'react';
import { useLocation } from 'wouter';
import { Box, Flex, Grid, Heading, Image, Link, Text } from '@chakra-ui/react';
import { Header, MinterButton } from '../common';
import placeholderAsset from '../common/placeholder_asset.png';
import { RefreshCw } from 'react-feather';

export default function AssetsPage() {
  const [, setLocation] = useLocation();
  return (
    <Flex pos="absolute" w="100%" h="100%">
      <Flex justifyContent="space-between" width="100%" flexDir="column">
        <Header />
        <Flex flex="1" w="100%" minHeight="0">
          <Flex w="90px" h="100%"></Flex>
          <Flex
            flexDir="column"
            h="100%"
            w="100%"
            px={20}
            pt={10}
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
              <Heading size="lg">All Assets</Heading>
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
