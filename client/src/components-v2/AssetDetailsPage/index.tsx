import React from 'react';
import { useLocation } from 'wouter';
import {
  AspectRatio,
  Box,
  Flex,
  Heading,
  Image,
  Link,
  Text
} from '@chakra-ui/react';
import { ChevronLeft, MoreHorizontal } from 'react-feather';
import { Header, MinterButton } from '../common';
import placeholderAsset from '../common/placeholder_asset.png';

interface AssetsDetailPageProps {
  contractAddress: string;
  tokenId: number;
}

export default function AssetsDetailPage(props: AssetsDetailPageProps) {
  const [, setLocation] = useLocation();
  return (
    <Flex pos="absolute" w="100%" h="100%">
      <Flex justifyContent="space-between" width="100%" flexDir="column">
        <Header />
        <Flex flex="1" width="100%" minHeight="0">
          <Flex flexDir="column" w="50%" h="100%">
            <Flex py={8} px={8}>
              <MinterButton
                variant="primaryActionInverted"
                onClick={e => {
                  e.preventDefault();
                  setLocation('/assets');
                }}
              >
                <Box color="currentcolor">
                  <ChevronLeft size={16} strokeWidth="3" />
                </Box>
                <Text ml={2}>Assets</Text>
              </MinterButton>
            </Flex>
            <Flex align="center" justify="center" flex="1" px={16}>
              <AspectRatio
                ratio={4 / 3}
                width="100%"
                borderRadius="3px"
                boxShadow="0 0 5px rgba(0,0,0,.15)"
                overflow="hidden"
              >
                <Image src={placeholderAsset} objectFit="cover" />
              </AspectRatio>
            </Flex>
          </Flex>
          <Flex
            bg="brand.brightGray"
            borderLeftWidth="1px"
            borderLeftColor="brand.lightBlue"
            flexDir="column"
            w="50%"
            h="100%"
            px={8}
            pt={8}
            overflowY="scroll"
          >
            <Flex
              flexDir="column"
              w="100%"
              bg="white"
              border="1px solid"
              borderColor="brand.lightBlue"
              borderRadius="3px"
              py={6}
            >
              <Flex
                justify="space-between"
                align="center"
                w="100%"
                px={8}
                pb={6}
                borderBottom="1px solid"
                borderColor="brand.lightBlue"
              >
                <Flex flexDir="column">
                  <Text color="brand.blue">Minter</Text>
                  <Heading color="black" size="lg">
                    Asset Name
                  </Heading>
                </Flex>
                <Box color="gray.300">
                  <MoreHorizontal />
                </Box>
              </Flex>
              <Flex
                px={8}
                py={6}
                fontSize="1rem"
                borderBottom="1px solid"
                borderColor="brand.lightBlue"
              >
                Description
              </Flex>
              <Flex flexDir="column" px={8} pt={6}>
                <Text pb={2} fontSize="xs" color="brand.gray">
                  IPFS HASH
                </Text>
                <Text>98u31j2kide...</Text>
              </Flex>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
}
