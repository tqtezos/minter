import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { AspectRatio, Box, Flex, SimpleGrid, Image, Text } from '@chakra-ui/react';
import { Wind, HelpCircle } from 'react-feather';
import { Token, CollectionsState } from '../../../reducer/slices/collections';
import { ipfsUriToGatewayUrl } from '../../../lib/util/ipfs';
import { useSelector } from '../../../reducer';

interface TokenTileProps extends Token {
  network: string;
  selectedCollection: string;
}

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
        src={props.src}
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

  return <MediaNotFound />;
}

function TokenTile(props: TokenTileProps) {
  const [, setLocation] = useLocation();
  return (
    <Flex
      flexDir="column"
      ratio={1}
      w="100%"
      bg="white"
      border="2px solid"
      borderColor="666"
      borderRadius="0px"
      overflow="hidden"
      boxShadow="0px 0px 10px #3333"
      transition="all linear 50ms"
      _hover={{
        cursor: 'pointer',
        boxShadow: '0px 0px 0px 4px rgba(15, 97, 255, 0.1)'
      }}
      onClick={() =>
        setLocation(`/collection/${props.selectedCollection}/token/${props.id}`)
      }
    >
      <AspectRatio ratio={3 / 2}>
        <Box p={4}>
          <TokenImage
            src={ipfsUriToGatewayUrl(props.network, props.artifactUri)}
          />
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

interface TokenGridProps {
  state: CollectionsState;
  walletAddress: string;
}

export default function TokenGrid({ state, walletAddress }: TokenGridProps) {
  const network = useSelector(s => s.system.config.network);
  const selectedCollection = state.selectedCollection;

  if (selectedCollection === null) {
    return <></>;
  }

  const collection = state.collections[selectedCollection];

  if (!collection || collection.tokens === null) {
    return <></>;
  }

  const tokens = collection.tokens.filter(
    ({ owner, sale }) => owner === walletAddress || sale?.seller === walletAddress
  );

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
            No owned tokens to display in this collection
          </Text>
        </Flex>
      </Flex>
    );
  }

  return (
    <SimpleGrid columns={{sm: 1, md: 2, lg: 3, xl: 4}} gap={8} pb={8}>
      {tokens.map(token => {
        return (
          <TokenTile
            key={token.id}
            selectedCollection={selectedCollection}
            network={network}
            {...token}
          />
        );
      })}
    </SimpleGrid>
  );
}
