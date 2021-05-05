import React, { useEffect } from 'react';
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Flex,
  Heading,
  Link,
  Menu,
  MenuList,
  Modal,
  ModalCloseButton,
  ModalContent,
  Text,
  useDisclosure
} from '@chakra-ui/react';
import { HelpCircle, MoreHorizontal } from 'react-feather';
import { MinterMenuButton, MinterMenuItem } from '../../common';
import { TransferTokenModal } from '../../common/modals/TransferToken';
import { SellTokenButton } from '../../common/modals/SellToken';
import { CancelTokenSaleButton } from '../../common/modals/CancelTokenSale';
import { BuyTokenButton } from '../../common/modals/BuyToken';
import { useSelector, useDispatch } from '../../../reducer';
import {
  getContractNftsQuery,
  getNftAssetContractQuery
} from '../../../reducer/async/queries';
import { TokenMedia } from '../../common/TokenMedia';
import lk from '../../common/assets/link-icon.svg'
import tz from '../../common/assets/tezos-sym.svg'

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
    <Flex flexDir="column" bg="brand.brightGray" flexGrow={1}>
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
          backgroundColor="#111111fc"
          zIndex="2000"
          margin="0 !important"
          borderRadius="0"
        >
          <TokenMedia
            key={`${token.address}-${token.id}`}
            config={system.config}
            {...token}
            metadata={token?.metadata}
            maxW="95vw"
            maxH="95vh"
            objectFit="scale-down"
          />
          <ModalCloseButton
            position="absolute"
            right="0px !important"
            display="block !important"
            fontSize="18px"
            top="0px !important"
            borderLeft="2px solid #aaa"
            color="white"
            borderTop="2px solid #aaa"
            width="4rem"
            height="4rem"
            borderRight="none"
            borderBottom="none"
            borderBottomEndRadius="0"
            borderTopStartRadius="0"
            borderTopEndRadius="0"
            border="0"
          />
        </ModalContent>
      </Modal>
      <Flex
        px={[0, 16]}
        pt={0}
        pb={0}
        width={['100%']}
        maxHeight={["50vh", "60vh", "70vh"]}
        height={["100%"]}
        justifyContent="center"
        alignItems="center"
        boxShadow="0px 0px 8px #333"
        zIndex="100"
      >
        <TokenMedia
          key={`${token.address}-${token.id}`}
          config={system.config}
          {...token}
          metadata={token?.metadata}
          maxW="85%"
          maxH="85%"
          objectFit="contain"
          cursor="pointer"
          onClick={onOpen}
        />
      </Flex>
      <Flex width={['100%']} bg="white" flexDir="column" flexGrow={1}>
        <Flex
          width={['90%', '90%', '70%']}
          mx="auto"
          marginBottom={[7, 0]}
          flexDir="column"
          px={[4, 16]}
          flex="1"
        >
          <Flex
            flexDir="column"
            w="100%"
            bg="white"
            py={1}
            mb={10}
            pos="relative"
          >
            <Heading textAlign="left" color="brand.black" width={["100%", "100%", "80%"]} fontSize={["10vw", "3vw"]} display="inline-block" mt={[2, 4]}>
              {token.title}
            </Heading>
            <Text
              fontSize="md"
              color="brand.neutralGray"
              fontWeight="bold"
              mt={[2, 4]}
              width={['100%', '100%', '80%']}
            >
              {token.description || 'No description provided'}
            </Text>
            <Accordion allowToggle mt={4}>
              <AccordionItem border="none">
                <AccordionButton p={0}>
                  <Text color="brand.neutralGray">Token Info</Text>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={[4, 1]}>
                  <Flex mt={[4, 8]}>
                    <Text color="brand.neutralGray">Minter:</Text>
                    <Text color="brand.darkGray" fontWeight="bold" ml={[1]} whiteSpace="nowrap" overflow="hidden">
                      <Link display="block" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis" href={`https://${(system.config.network + '.').replace('mainnet.', '')}tzkt.io/${token?.metadata?.minter}`}>{token?.metadata?.minter}&nbsp;<sup><img src={lk} alt="" width="auto" height="auto" style={{ display: 'inline-block' }} /></sup></Link>
                    </Text>
                  </Flex>
                  <Flex mt={[4, 8]}>
                    <Text color="brand.neutralGray">Collection:</Text>
                    <Text color="brand.darkGray" fontWeight="bold" ml={[1]} whiteSpace="nowrap" overflow="hidden">
                      <Link display="block" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis" href={`https://${(system.config.network + '.').replace('mainnet.', '')}tzkt.io/${contractAddress}`}>{state.selectedCollection
                        ? state.collections[state.selectedCollection]?.metadata.name : collection?.metadata.name ? collection?.metadata.name : contractAddress }&nbsp;<sup><img src={lk} alt="" width="auto" height="auto" style={{ display: 'inline-block' }} /></sup></Link>
                    </Text>
                  </Flex>
                  {token?.metadata?.attributes?.map(({ name, value }) => (
                    <Flex key={name + value} mt={[4, 8]}>
                      <Text color="brand.neutralGray">{name}:</Text>
                      <Text display="block" color="brand.darkGray" fontWeight="bold" ml={[1]} whiteSpace="nowrap" overflow="hidden" textOverflow="wrap">
                        {value}
                      </Text>
                    </Flex>
                  ))}
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
            <Flex display={['flex']} justifyContent="space-between" alignItems="center" width="100%" flexDir={['column', 'row']} flexWrap="wrap" position={["fixed", "inherit"]} bottom="0" left="0">
              <Flex justifyContent={["space-between", "flex-start"]} alignItems="center" width="100%" px={[4, 0]} py={[4]} boxShadow={["0px 0px 8px #333", "none"]} bg="#fff">
                {token.sale ? (
                  isOwner ? (
                    <>
                      <Text color="brand.black" fontSize="xl" fontWeight="700" marginRight={[0, 16]}>
                        {token.sale.price} <img src={tz} alt="" width={10} height="auto" style={{ display: 'inline-block' }} />
                      </Text>
                      <Box marginRight={[8, 16]}>
                        <CancelTokenSaleButton
                          contract={contractAddress}
                          tokenId={tokenId}
                        />
                      </Box>
                    </>
                  ) : (
                    <>
                      <Text color="black" fontSize={['md', 'md', 'lg']} fontWeight="700" marginRight={[0, 16]}>
                        {token.sale.price.toFixed(2)} <img src={tz} alt="" width={10} height="auto" style={{ display: 'inline-block' }} />
                      </Text>
                      <Box marginRight={[0, 16]}>
                        <BuyTokenButton contract={contractAddress} token={token} />
                      </Box>
                    </>
                  )
                ) : isOwner ? (
                  <Box marginRight={[8, 16]}>
                    <SellTokenButton contract={contractAddress} tokenId={tokenId} />
                  </Box>
                ) : (
                  <></>
                )}
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
                      {token.sale ? (
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
                      tokenId={tokenId}
                      disclosure={disclosure}
                    />
                  </Menu>
                ) : (
                  <></>
                )}
              </Flex>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </Flex >
  );
}

export default TokenDetail;
