import React, { useState } from 'react';
import { Token } from '../../reducer/slices/collections';
import { useLocation } from 'wouter';
import { IpfsGatewayConfig } from '../../lib/util/ipfs';
import { AspectRatio, Box, Flex, Heading } from '@chakra-ui/react';
import { TokenMedia } from './TokenMedia';
import { useSelector } from '../../reducer';

interface TokenCardProps extends Token {
  config: IpfsGatewayConfig;
  selectedCollection?: string;
  height?: string;
  opacity?: string | number;
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
      asset.crossOrigin = "Anonymous";
      asset.src = src;
    } else if (/^video\/.*/.test(type)) {
      asset = video;
      asset.onloadeddata = load;
      asset.crossOrigin = "Anonymous";
      asset.src = src + '#t=1';
    } else {
      return resolve({ r: 255, g: 255, b: 255 });
    }
  });
}

export default function TokenCard(props: TokenCardProps) {
  const [, setLocation] = useLocation();
  const [obj, setObj] = useState<{ r: number, g: number, b: number }>({ r: 255, g: 255, b: 255 });
  const { config } = useSelector(s => s.system);

  return (
    <Flex
      opacity={props.opacity ?? '1'}
      position="relative"
      role="group"
      flexDir="column"
      ratio={1}
      height={props.height ?? "100%"}
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
            {...props}
            config={config}
            onLoad={async (url: string, type: string) => {
              let rgb = await getAverageRGB(url, type) as any;
              setObj(rgb);
            }}
          />
        </Box>
      </AspectRatio>
      <Flex
        width="100%"
        opacity={[1, 0]}
        bg="#191919d9"
        flexDir="row"
        flexWrap="nowrap"
        justifyContent="center"
        alignItems="center"
        borderTopRightRadius="2px"
        borderTopLeftRadius="2px"
        position="absolute"
        bottom="0"
        transition="0.25s all"
        _groupHover={{
          opacity: 1
        }}
      >
        {props.sale?.price ? <><Heading size="1.45rem !important" fontWeight="400" textAlign="center" color="white" width={props.sale?.price ? "25%" : "0%"} display="flex" justifyContent="center" alignItems="center">{props.sale?.price} &#42793;</Heading></> : <></>}
        <Heading size="1.45rem !important" color="white" height="24px" textAlign={props.sale?.price ? "right" : "center"} textOverflow="ellipsis" width={props.sale?.price ? "75%" : "100%"} paddingRight="5%">{props.title}</Heading>
      </Flex>
    </Flex>
  );
}