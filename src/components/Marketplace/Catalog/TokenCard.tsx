import React, { useState } from 'react';
import { Token } from '../../../reducer/slices/collections';
import { useLocation } from 'wouter';
import { ipfsUriToGatewayUrl } from '../../../lib/util/ipfs';
import { AspectRatio, Box, Flex, Text, Heading } from '@chakra-ui/react';
import { TokenMedia } from '../../common/TokenMedia';

interface TokenCardProps extends Token {
  network: string;
}

function getAverageRGB(src: string, type: string) {
  return new Promise(resolve => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d') as CanvasRenderingContext2D ?? {} as any;
    let asset: HTMLImageElement | HTMLVideoElement;
    let image = new window.Image();
    let video = document.createElement('video');

    const load = async function () {
      let rgb = { r: 255, g: 255, b: 255 }
      let height = canvas.height = asset.offsetHeight || asset.height || (asset as HTMLVideoElement)?.videoHeight;
      let width = canvas.width = asset.offsetWidth || asset.width || (asset as HTMLVideoElement)?.videoWidth;
      context.drawImage(asset, 0, 0, width, height);
      let data;
      try {
        data = context.getImageData(0, 0, width, height);
      } catch (e) {
        console.log(e);
        return resolve(rgb);
      }
      let length = data?.data.length, blockSize = 4, i = 0, count = 0;
      if (!length) { return resolve(rgb); }
      while ((i += blockSize * 4) < length) {
        ++count;
        rgb.r += data.data[i];
        rgb.g += data.data[i + 1];
        rgb.b += data.data[i + 2];
      }
      rgb.r = ~~(rgb.r / (count));
      rgb.g = ~~(rgb.g / (count));
      rgb.b = ~~(rgb.b / (count));
      return resolve(rgb);
    }

    if (/^image\/.*/.test(type)) {
      asset = image;
      asset.onload = load;
      asset.src = src;
      asset.crossOrigin = "Anonymous";
    } else if (/^video\/.*/.test(type)) {
      asset = video;
      asset.onloadeddata = load;
      asset.src = src+'#t=1';
      asset.crossOrigin = "Anonymous";
    } else {
      return resolve({ r: 255, g: 255, b: 255 });
    }
  });
}

export default function TokenCard(props: TokenCardProps) {
  const [, setLocation] = useLocation();
  const [obj, setObj] = useState<{ r: number, g: number, b: number }>({ r: 255, g: 255, b: 255 });
  const src = ipfsUriToGatewayUrl(props.network, props.artifactUri);
  return (
    <Flex
      flexDir="column"
      ratio={1}
      w="100%"
      background={`rgb(${obj.r},${obj.g},${obj.b})`}
      border="2px solid"
      borderColor="#666"
      borderRadius="3px"
      overflow="hidden"
      boxShadow="0px 0px 10px #3333"
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
        <Box>
          <TokenMedia
            src={src}
            onLoad={async (url: string, type: string) => {
              let rgb = await getAverageRGB(url, type) as any;
              setObj(rgb);
            }}
          />
        </Box>
      </AspectRatio>
      <Flex
        width="calc(100% - 1rem)"
        px={4}
        py={4}
        mx={2}
        bg="white"
        borderTop="1px solid"
        borderColor="brand.lightBlue"
        flexDir="row"
        flexWrap="nowrap"
        justifyContent="space-evenly"
        alignItems="center"
        height="100%"
        borderTopRightRadius="2px"
        borderTopLeftRadius="2px"
      >
        <Heading size="sm">{props.title}</Heading>
        <Text fontSize="sm">Seller: {props.sale?.seller.substr(0, 5)}...{props.sale?.seller.substr(-5)}</Text>
        <Text fontSize="md" fontWeight="600">{props.sale?.price} ꜩ</Text>
      </Flex>
    </Flex>
  );
}
