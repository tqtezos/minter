import React, { useEffect, useState } from 'react';
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Menu,
  MenuList,
  Modal,
  ModalCloseButton,
  ModalContent,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Text,
  useDisclosure
} from '@chakra-ui/react';
import { ChevronLeft, ChevronRight, HelpCircle, MoreHorizontal } from 'react-feather';
import { MinterButton, MinterMenuButton, MinterMenuItem } from '../../common';
import { TransferTokenModal } from '../../common/modals/TransferToken';
import { SellTokenButton } from '../../common/modals/SellToken';
import { CancelTokenSaleButton } from '../../common/modals/CancelTokenSale';
import { BuyTokenButton } from '../../common/modals/BuyToken';
import { ipfsUriToGatewayUrl } from '../../../lib/util/ipfs';
import { useSelector, useDispatch } from '../../../reducer';
import {
  getContractNftsQuery, getNftAssetContractQuery
} from '../../../reducer/async/queries';
import { Switch } from "@chakra-ui/react"
import { Maximize2 } from 'react-feather';
import TokenCard from '../../common/TokenCard';
import { TokenMedia } from '../../common/TokenMedia';
import { Nft } from '../../../lib/nfts/queries';


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
}

function TokenDetail({ contractAddress, tokenId }: TokenDetailProps) {
  const { system, collections: state } = useSelector(s => s);
  const disclosure = useDisclosure();
  const dispatch = useDispatch();
  const collection = state.collections[contractAddress];
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [, setZoom] = useState(0);
  const [initialZoom] = useState(0);
  const [mediaType] = useState('');
  const [obj, setObj] = useState({ opacity: 1, ownedOnly: false } as any);

  const collectionUndefined = collection === undefined;

  useEffect(() => {
    if (collectionUndefined) {
      dispatch(getNftAssetContractQuery(contractAddress));
    } else {
      dispatch(getContractNftsQuery(contractAddress));
    }
  }, [contractAddress, tokenId, collectionUndefined, dispatch]);

  let tokens = obj.ownedOnly ? collection?.tokens?.filter(token => token.owned) : collection?.tokens;
  if (!tokens) {
    return null;
  }

  let token = tokens?.find((token: Nft, idx) => { if (token?.id === tokenId) { if (obj?.idx === undefined) { setObj({ ...obj, idx }); } return token ?? null; } return null; });

  if (obj.opacity === 0) { setObj({ ...obj, opacity: 1 }) };

  if (!token) {
    return <NotFound />;
  }

  const isOwner = tokens[obj.idx]?.owned ?? false;

  return (
    <Flex flexDir={["column-reverse", "row"]} flexWrap="nowrap" bg="brand.brightGray" flexGrow={1}>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="full"
        scrollBehavior="inside"
      >
        <ModalContent
          height="100vh"
          maxHeight="unset"
          width="100vw"
          display="flex"
          flexDirection="column"
          flexWrap="nowrap"
          justifyContent="center"
          alignItems="center"
          position="relative"
          backgroundColor="#333333f9"
          zIndex="2000"
          margin="0 !important"
          borderRadius="0"
        >
          {/^image\/.*/.test(mediaType) ? (
            <Flex
              height="3rem"
              alignItems="center"
              position="sticky"
              top={0}
              left={0}
            >
              <Slider
                defaultValue={initialZoom}
                min={initialZoom}
                max={1}
                step={0.01}
                width="10rem"
                margin="auto"
                onChange={setZoom}
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
            </Flex>
          ) : (
            ''
          )}

          <TokenMedia
            config={system.config}
            maxW="85%"
            {...tokens[obj.idx]}
          />
          <ModalCloseButton
            position="absolute"
            right="0 !important"
            bottom="0 !important"
            display="block !important"
            fontSize="18px"
            top="unset"
            borderLeft="2px solid #aaa"
            color="white"
            borderTop="2px solid #aaa"
            width="4rem"
            height="4rem"
            borderRight="none"
            borderBottom="none"
            borderBottomStartRadius="0"
            borderBottomEndRadius="0"
            borderTopEndRadius="0"
            border="0"
          />
        </ModalContent>
      </Modal>
      <Flex width={['100vw', '25vw']} bg="white" flexDir="column" borderRight="2px solid #aaa">
        <Flex pt={8} px={8} justifyContent="space-between">
          <MinterButton
            variant="primaryActionInverted"
            onClick={e => {
              e.preventDefault();
              window.history.back();
            }}
          >
            <Box color="currentcolor">
              <ChevronLeft size={16} strokeWidth="3" />
            </Box>
          </MinterButton>
          <FormControl display="flex" alignItems="center" width="auto">
            <FormLabel htmlFor="owned-toggle" mb="0">
              {!obj.ownedOnly ? "All" : "Owned"}
            </FormLabel>
            <Switch size="lg" id="owned-toggle" onChange={(e) => { setObj({ ...obj, ownedOnly: !obj.ownedOnly }) }} />
          </FormControl>
        </Flex>
        <Flex
          width={['100%']}
          flexDir="column"
          px={[8]}
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
            <Heading color="brand.black" size="xl">
              {tokens[obj.idx]?.title}
            </Heading>
            <Text
              fontSize="md"
              color="brand.neutralGray"
              fontWeight="bold"
              mt={[2, 4]}
            >
              {tokens[obj.idx]?.description || 'No description provided'}
            </Text>
            <Flex mt={[4, 8]}>
              <Flex flexDir="column" width={['100%', 'auto']}>
                <Text color="brand.neutralGray">Collection</Text>
                <Text color="brand.darkGray" fontWeight="bold" mt={[2, 4]}>
                  {contractAddress}
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
                  {token.metadata?.attributes?.map(({ name, value }, idx: number) => (
                    <Flex key={idx} mt={[4, 8]}>
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
      <Flex
        align="center"
        flex="1"
        px={[4, 0]}
        mx="auto"
        width={['100%']}
        height="calc(100vh - 4rem)"
        flexDir="column"
        position="relative"
        justifyContent="flex-start"
      >
        <TokenCard
          address={ipfsUriToGatewayUrl(system.config, tokens[obj.idx]?.artifactUri)}
          config={system.config}
          {...(tokens ? tokens[obj.idx] : {} as any)}
          height="calc(100% - 3.5rem)"
          opacity={obj.opacity}
        />
        <Flex align="center" justify="space-between" width="calc(100% - 0.25rem)" py={2} position="absolute" bottom="0" bg="white" borderLeft="2px solid #aaa" borderRight="2px solid #aaa">
          <MinterButton
            variant="primaryActionInverted"
            onClick={e => {
              setObj({ ...obj, idx: (obj?.idx - 1) % (tokens?.length ?? 1) });
            }}
          >
            <Box color="currentcolor">
              <ChevronLeft size={16} strokeWidth="3" />
            </Box>
          </MinterButton>
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
                {tokens[obj.idx]?.sale ? (
                  <></>
                ) : (
                  <MinterMenuItem
                    w={[100]}
                    variant="primary"
                    onClick={disclosure.onOpen}
                  >
                    Transfer
                  </MinterMenuItem>
                )}
              </MenuList>
              <TransferTokenModal
                contractAddress={contractAddress}
                tokenId={tokens[obj.idx]?.id}
                disclosure={disclosure}
              />
            </Menu>
          ) : (
            <></>
          )}

          {tokens[obj.idx]?.sale ? (
            isOwner ? (
              <>
                <Flex direction="column">
                  <Flex align="center" alignSelf="center">
                    <Text color="brand.black" fontSize="xl" fontWeight="700">
                      {tokens[obj.idx]?.sale?.price} &#42793;
                    </Text>
                  </Flex>
                </Flex>
                <CancelTokenSaleButton
                  contract={contractAddress}
                  tokenId={tokens[obj.idx].id}
                />
              </>
            ) : (
              <>
                <Text color="black" fontSize={['sm', 'lg']} mr={1}>
                  {tokens[obj.idx]?.sale?.price.toFixed(2)} &#42793;
                </Text>
                <BuyTokenButton contract={contractAddress} token={tokens[obj.idx]} />
              </>
            )
          ) : isOwner ? (
            <SellTokenButton contract={contractAddress} tokenId={tokens[obj.idx]?.id} />
          ) : (
            <></>
          )}
          <Button onClick={onOpen}>
            <Maximize2 size={16} strokeWidth="3" />
          </Button>
          <MinterButton
            variant="primaryActionInverted"
            onClick={() => {
              setObj({ ...obj, opacity: 0 })
              setTimeout(() => setObj({ ...obj, idx: (obj?.idx + 1) % (tokens?.length ?? 1) }), 250);
            }}
          >
            <Box color="currentcolor">
              <ChevronRight size={16} strokeWidth="3" />
            </Box>
          </MinterButton>
        </Flex>
      </Flex>
    </Flex>
  );
}

export default TokenDetail;
