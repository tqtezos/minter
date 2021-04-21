import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import {
  AspectRatio,
  Box,
  Flex,
  Heading,
  Image,
  Link,
  SimpleGrid,
  Spinner,
  Text
} from '@chakra-ui/react';
import { MinterButton } from '../../common';
import { RefreshCw, ExternalLink, Wind, HelpCircle } from 'react-feather';
import { Token } from '../../../reducer/slices/collections';
import { ipfsUriToGatewayUrl } from '../../../lib/util/ipfs';
import { useDispatch, useSelector } from '../../../reducer';
import { getContractNftsQuery } from '../../../reducer/async/queries';
import CollectionsDropdown from './CollectionsDropdown';

function MediaNotFound() {
  return (
    <Flex
      flexDir="column"
      align="center"
      justify="center"
      flex="1"
      bg="gray.100"
      color="gray.300"
      height="100%"
    >
      <HelpCircle size="70px" />
    </Flex>
  );
}

function TokenImage(props: TokenTileProps) {
  const src = ipfsUriToGatewayUrl(props.network, props.artifactUri);
  const [errored, setErrored] = useState(false);
  const [obj, setObj] = useState<{ url: string; type: string } | null>(null);
  useEffect(() => {
    (async () => {
      let blob;
      try {
        blob = await fetch(src).then(r => r.blob());
      } catch (e) {
        return setErrored(true);
      }
      setObj({
        url: URL.createObjectURL(blob),
        type: blob.type
      });
    })();
  }, [src]);

  if (errored) {
    return <MediaNotFound />;
  }

  if (!obj) return null;

  if (/^image\/.*/.test(obj.type)) {
    return (
      <Image
        src={src}
        objectFit="scale-down"
        flex="1"
        height="100%"
        onError={() => setErrored(true)}
      />
    );
  }

  if (/^video\/.*/.test(obj.type)) {
    return (
      <video
        loop
        onClick={e => e.preventDefault()}
        onMouseEnter={e => e.currentTarget.play()}
        onMouseLeave={e => e.currentTarget.pause()}
      >
        <source src={obj.url} type={obj.type} />
      </video>
    );
  }

  if (props.metadata.formats?.length) {
    if (props.metadata.formats[0].mimeType === 'model/gltf-binary' ||
      props.metadata.formats[0].mimeType === 'model/gltf+json'
    ) {
      return (
        <>
          <model-viewer
            auto-rotate
            rotation-per-second="30deg"
            src={obj.url}
            class="grid"
          ></model-viewer>
        </>
      );
    }
  }

  return <MediaNotFound />;
}

interface TokenTileProps extends Token {
  network: string;
  address: string;
}

function TokenTile(props: TokenTileProps) {
  const [, setLocation] = useLocation();
  return (
    <Flex
      flexDir="column"
      ratio={1}
      w="100%"
      bg="white"
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
      onClick={() =>
        setLocation(`/collection/${props.address}/token/${props.id}`)
      }
    >
      <AspectRatio ratio={3 / 2}>
        <Box p={4}>
          <TokenImage {...props} />
        </Box>
      </AspectRatio>
      <Flex
        width="100%"
        px={4}
        py={4}
        bg="white"
        borderTop="1px solid"
        borderColor="brand.lightBlue"
      >
        <Text>{props.title}</Text>
      </Flex>
    </Flex>
  );
}

interface CollectionDisplayProps {
  address: string | null;
  ownedOnly?: boolean;
}

export default function CollectionDisplay({
  address,
  ownedOnly = true
}: CollectionDisplayProps) {
  const collections = useSelector(s => s.collections);
  const { config, tzPublicKey, wallet } = useSelector(s => s.system);
  const dispatch = useDispatch();

  useEffect(() => {
    if (address !== null) {
      dispatch(getContractNftsQuery(address));
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

  const tokens = ownedOnly
    ? collection.tokens.filter(
        ({ owner, sale }) =>
          owner === tzPublicKey || sale?.seller === tzPublicKey
      )
    : collection.tokens;

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
      {ownedOnly && wallet !== null ? (
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
      >
        <Flex flexDir="column" width="100%">
          <Flex justify="space-between" width="100%">
            <Heading size="lg">{collection.metadata.name || ''}</Heading>
          </Flex>
          <Flex align="center" display={{ base: 'none', md: 'flex' }}>
            <Text fontFamily="mono" color="brand.lightGray">
              {collection.address}
            </Text>
            <Link
              href={config.bcd.gui + '/' + collection.address}
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
        >
          <Box color="currentcolor">
            <RefreshCw size={16} strokeWidth="3" />
          </Box>
          <Text ml={2}>Refresh</Text>
        </MinterButton>
      </Flex>
      <SimpleGrid columns={{ sm: 1, md: 2, lg: 3, xl: 4 }} gap={8} pb={8}>
        {tokens.map(token => {
          return (
            <TokenTile
              key={token.id}
              address={address}
              network={config.network}
              {...token}
            />
          );
        })}
      </SimpleGrid>
    </Flex>
  );
}
