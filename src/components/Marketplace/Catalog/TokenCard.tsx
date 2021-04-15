import React, { useState } from 'react';
import { Token } from '../../../reducer/slices/collections';
import { useLocation } from 'wouter';
import { ipfsUriToGatewayUrl } from '../../../lib/util/ipfs';
import { AspectRatio, Box, Flex, Heading } from '@chakra-ui/react';
import { TokenMedia } from '../../common/TokenMedia';

interface TokenCardProps extends Token {
  network: string;
}

export function getAverageRGB(src: string, type: string) {
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
      asset.src = src + '#t=1';
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
      position="relative"
      role="group"
      flexDir="column"
      ratio={1}
      w="100%"
      background={`rgb(${obj.r},${obj.g},${obj.b})`}
      border="2px solid"
      borderColor="#fff"
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
      <AspectRatio ratio={3 / 2} height="100%">
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
        opacity="0"
        width="100%"
        bg="#191919d9"
        borderTop="1px solid"
        borderColor="#fff"
        flexDir="column"
        flexWrap="nowrap"
        justifyContent="space-evenly"
        alignItems="center"
        height="100%"
        bottom="0"
        borderTopRightRadius="2px"
        borderTopLeftRadius="2px"
        _groupHover={{ opacity: 1 }}
        position="absolute"
        transition="0.25s all"
      >
        <Heading size="1.4rem" fontWeight="400" textAlign="center" color="white">{props.sale?.price} ꜩ</Heading>
        <Heading size="1.4rem" color="white" textAlign="center" textOverflow="ellipsis">{props.title}</Heading>
      </Flex>
    </Flex>
  );
} 