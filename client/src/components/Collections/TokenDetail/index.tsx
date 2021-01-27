import React, { Dispatch, useEffect, useContext, useState } from 'react';
import { useLocation } from 'wouter';
import { SystemContext } from '../../../context/system';
import { AspectRatio, Box, Flex, Heading, Image, Text } from '@chakra-ui/react';
import { ChevronLeft, HelpCircle, MoreHorizontal, Star } from 'react-feather';
import { MinterButton } from '../../common';
import { State, Action } from '../reducer';
import {
  getNftAssetContract,
  getContractNfts
} from '../../../lib/nfts/queries';
import { TransferTokenButton } from '../../common/TransferToken';

function NotFound() {
  return (
    <Flex flex="1" width="100%" justify="center">
      <Flex w="100%" flex="1" flexDir="column" align="center">
        <Flex
          px={32}
          py={16}
          bg="gray.100"
          textAlign="center"
          align="center"
          borderRadius="5px"
          flexDir="column"
          fontSize="xl"
          borderColor="gray.200"
          borderWidth="5px"
          mt={36}
          color="gray.300"
        >
          <HelpCircle size="100px" />
          <Heading size="xl" fontWeight="normal" pt={8} color="gray.400">
            Token not found
          </Heading>
        </Flex>
      </Flex>
    </Flex>
  );
}

interface TokenDetailProps {
  contractAddress: string;
  tokenId: number;
  state: State;
  dispatch: Dispatch<Action>;
}

function TokenImage(props: { src: string }) {
  const [errored, setErrored] = useState(false);

  if (errored) {
    return (
      <AspectRatio
        ratio={4 / 3}
        width="100%"
        borderRadius="3px"
        bg="gray.100"
        overflow="hidden"
      >
        <Flex flexDir="column" align="center" justify="center">
          <Box color="gray.300" pb={10}>
            <HelpCircle size="100px" />
          </Box>
          <Heading color="gray.300" size="xl">
            Image not found
          </Heading>
        </Flex>
      </AspectRatio>
    );
  }

  return (
    <AspectRatio
      ratio={4 / 3}
      width="100%"
      borderRadius="3px"
      boxShadow="0 0 5px rgba(0,0,0,.15)"
      overflow="hidden"
    >
      <Image
        src={props.src}
        objectFit="cover"
        onError={() => setErrored(true)}
      />
    </AspectRatio>
  );
}

export default function TokenDetail(props: TokenDetailProps) {
  const [, setLocation] = useLocation();
  const { system } = useContext(SystemContext);
  const { dispatch, contractAddress, tokenId } = props;
  const collection = props.state.collections[props.contractAddress];

  useEffect(() => {
    if (!collection) {
      getNftAssetContract(system, contractAddress).then(collection => {
        dispatch({
          type: 'update_collection',
          payload: { collection: { ...collection, tokens: null } }
        });
      });
    } else {
      getContractNfts(system, contractAddress).then(tokens => {
        dispatch({
          type: 'populate_collection',
          payload: { address: contractAddress, tokens }
        });
      });
    }
  }, [contractAddress, tokenId, collection === undefined]);

  if (!collection || collection.tokens === null) {
    return null;
  }

  const token = collection.tokens?.find(token => token.id === props.tokenId);
  if (!token) {
    return <NotFound />;
  }

  return (
    <Flex flex="1" width="100%" minHeight="0">
      <Flex flexDir="column" w="50%" h="100%" overflowY="scroll">
        <Flex py={8} px={8}>
          <MinterButton
            variant="primaryActionInverted"
            onClick={e => {
              e.preventDefault();
              setLocation('/collections', { replace: true });
            }}
          >
            <Box color="currentcolor">
              <ChevronLeft size={16} strokeWidth="3" />
            </Box>
            <Text ml={2}>Collections</Text>
          </MinterButton>
        </Flex>
        <Flex align="center" justify="center" flex="1" px={16}>
          <TokenImage src={`http://localhost:8080/ipfs/${token.ipfs_hash}`} />
        </Flex>
      </Flex>
      <Flex w="50%" h="100%" flexDir="column">
        <Flex
          bg="brand.brightGray"
          borderLeftWidth="1px"
          borderLeftColor="brand.lightBlue"
          flexDir="column"
          px={8}
          pt={8}
          flex="1"
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
            mb={10}
          >
            {system.tzPublicKey && system.tzPublicKey === token.owner ? (
              <Flex>
                <Flex
                  py={1}
                  px={3}
                  mb={3}
                  borderRightRadius="5px"
                  bg="brand.turquoise"
                  color="brand.black"
                  align="center"
                  justify="center"
                >
                  <Star fill="currentColor" size={16} />
                  <Text fontWeight="600" ml={2} fontSize="sm">
                    You own this asset
                  </Text>
                </Flex>
              </Flex>
            ) : null}
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
                <Text color="brand.blue">
                  {collection.metadata.name || collection.address}
                </Text>
                <Heading color="black" size="lg">
                  {token.title}
                </Heading>
              </Flex>
              {/* TODO: Add dropdown menu that contains transfer/share links */}
              {/* <Box color="gray.300"> */}
              {/*   <MoreHorizontal /> */}
              {/* </Box> */}
            </Flex>
            <Flex
              px={8}
              py={6}
              fontSize="1rem"
              borderBottom="1px solid"
              borderColor="brand.lightBlue"
            >
              {token.description ? (
                token.description
              ) : (
                <Text fontSize="md" color="brand.gray">
                  No description provided
                </Text>
              )}
            </Flex>
            <Flex flexDir="column" px={8} pt={6}>
              <Text pb={2} fontSize="xs" color="brand.gray">
                IPFS HASH
              </Text>
              <Text>{token.ipfs_hash || 'No IPFS hash'}</Text>
            </Flex>
          </Flex>
          {system.status === 'WalletConnected' ? (
            <Flex
              w="100%"
              bg="white"
              border="1px solid"
              borderColor="brand.lightBlue"
              borderRadius="3px"
              py={6}
              px={8}
            >
              <TransferTokenButton
                contractAddress={contractAddress}
                tokenId={tokenId}
              />
            </Flex>
          ) : null}
        </Flex>
      </Flex>
    </Flex>
  );
}