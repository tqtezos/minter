import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  AspectRatio,
  Box,
  Button,
  Flex,
  Heading,
  Image,
  Menu,
  MenuList,
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  Text,
  useDisclosure
} from '@chakra-ui/react';
import { ChevronLeft, HelpCircle, MoreHorizontal, Star } from 'react-feather';
import { MinterButton, MinterMenuButton, MinterMenuItem } from '../../common';
import { TransferTokenModal } from '../../common/TransferToken';
import { SellTokenButton, CancelTokenSaleButton } from '../../common/SellToken';
import { BuyTokenButton } from '../../common/BuyToken';
import { ipfsUriToGatewayUrl } from '../../../lib/util/ipfs';
import { useSelector, useDispatch } from '../../../reducer';
import {
  getContractNftsQuery,
  getNftAssetContractQuery
} from '../../../reducer/async/queries';

import { Maximize2 } from 'react-feather';

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

function MediaNotFound() {
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

function TokenImage(props: { src: string }) {
  const [errored, setErrored] = useState(false);
  const [obj, setObj] = useState<{ url: string; type: string } | null>(null);
  useEffect(() => {
    (async () => {
      let blob;
      try {
        blob = await fetch(props.src).then(r => r.blob());
      } catch (e) {
        return setErrored(true);
      }
      setObj({
        url: URL.createObjectURL(blob),
        type: blob.type
      });
    })();
  }, [props.src]);

  if (errored) {
    return <MediaNotFound />;
  }
  if (!obj) return null;

  if (/^image\/.*/.test(obj.type)) {
    return (
      <Image
        key={0}
        src={props.src}
        objectFit="contain"
        flex={1}
        onError={() => setErrored(true)}
      />
    );
  }

  if (/^video\/.*/.test(obj.type)) {
    return (
      <video controls>
        <source src={obj.url} type={obj.type} />
      </video>
    );
  }

  return <MediaNotFound />;
}

interface TokenDetailProps {
  contractAddress: string;
  tokenId: number;
}

function TokenDetail({ contractAddress, tokenId }: TokenDetailProps) {
  const [, setLocation] = useLocation();
  const { system, collections: state } = useSelector(s => s);
  const disclosure = useDisclosure();
  const dispatch = useDispatch();
  const collection = state.collections[contractAddress];
  const { isOpen, onOpen, onClose } = useDisclosure();

  const collectionUndefined = collection === undefined;

  useEffect(() => {
    if (collectionUndefined) {
      dispatch(getNftAssetContractQuery(contractAddress));
    } else {
      dispatch(getContractNftsQuery(contractAddress));
    }
  }, [contractAddress, tokenId, collectionUndefined, dispatch]);

  if (!collection?.tokens) {
    return null;
  }

  const token = collection.tokens.find(token => token.id === tokenId);
  if (!token) {
    return <NotFound />;
  }

  const isOwner =
    system.tzPublicKey &&
    (system.tzPublicKey === token.owner ||
      system.tzPublicKey === token.sale?.seller);

  return (
    <Flex flexDir="column" bg="brand.brightGray">
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="full"
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <TokenImage
            src={ipfsUriToGatewayUrl(system.config.network, token.artifactUri)}
          />
        </ModalContent>
      </Modal>
      <Flex pt={8} px={8}>
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
      <Flex
        align="center"
        flex="1"
        pb={[4, 16]}
        px={[4, 16]}
        mx="auto"
        width={['90%', '70%']}
        flexDir="column"
      >
        <TokenImage
          src={ipfsUriToGatewayUrl(system.config.network, token.artifactUri)}
        />{' '}
        <Flex align="center" justify="space-evenly" width={['100%']} mt="4">
          {isOwner ? (
            <Menu>
              <MinterMenuButton variant="primary">
                <MoreHorizontal color="#25282B" />
              </MinterMenuButton>
              <MenuList
                borderColor="brand.lightBlue"
                borderRadius="2px"
                p={0}
                minWidth={[100]}
              >
                <MinterMenuItem
                  w={[100]}
                  variant="primary"
                  onClick={disclosure.onOpen}
                >
                  Transfer
                </MinterMenuItem>
              </MenuList>
              <TransferTokenModal
                contractAddress={contractAddress}
                tokenId={tokenId}
                disclosure={disclosure}
              />
            </Menu>
          ) : null}

          {token.sale ? (
            isOwner ? (
              <>
                <CancelTokenSaleButton
                  contract={contractAddress}
                  tokenId={tokenId}
                />
              </>
            ) : (
              <Flex
                flexDirection="column"
                align="stretch"
                width={['100%', 200]}
              >
                <Flex align="center" alignSelf="center">
                  <Text color="black" fontSize="3xl" mr={1}>
                    ꜩ
                  </Text>
                  <Text color="brand.black" fontSize="xl" fontWeight="700">
                    {token.sale.price.toFixed(2)}
                  </Text>
                </Flex>
                <BuyTokenButton contract={contractAddress} token={token} />
              </Flex>
            )
          ) : (
            <>
              <SellTokenButton contract={contractAddress} tokenId={tokenId} />
            </>
          )}
          <Button onClick={onOpen}>
            <Maximize2 size={16} strokeWidth="3" />
          </Button>
        </Flex>
      </Flex>
      <Flex width={['100%']} bg="white" flexDir="column">
        <Flex
          width={['90%', '70%']}
          mx="auto"
          flexDir="column"
          px={[4, 16]}
          flex="1"
        >
          <Flex
            flexDir="column"
            w="100%"
            bg="white"
            py={6}
            mb={10}
            pos="relative"
          >
            {isOwner ? (
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
            <Heading color="brand.black" size="xl">
              {token.title}
            </Heading>
            <Heading color="brand.darkGray" size="md" mt={[2, 4]}>
              Minter: {token.metadata?.minter || 'Unkown'}
            </Heading>
            <Text
              fontSize="md"
              color="brand.neutralGray"
              fontWeight="bold"
              mt={[2, 4]}
            >
              {token.description || 'No description provided'}
            </Text>
            <Flex mt={[4, 8]}>
              <Flex flexDir="column" width={['100%', 'auto']}>
                <Text color="brand.neutralGray">Owner</Text>
                <Text color="brand.darkGray" fontWeight="bold" mt={[2, 4]}>
                  {token.owner}
                </Text>
              </Flex>
            </Flex>
            <Accordion allowToggle>
              <AccordionItem border="none">
                <AccordionButton mt={[4, 8]} p={0}>
                  <Text color="brand.neutralGray">Metadata</Text>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4}>
                  {token.metadata?.attributes?.map(({ name, value }) => (
                    <Flex mt={[4, 8]}>
                      <Text color="brand.neutralGray">{name}:</Text>
                      <Text color="brand.darkGray" fontWeight="bold" ml={[1]}>
                        {value}
                      </Text>
                    </Flex>
                  ))}
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
}

export default TokenDetail;
