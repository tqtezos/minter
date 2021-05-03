import React, { MouseEventHandler, useEffect, useState } from 'react';
import { Flex, Image } from '@chakra-ui/react';
import { FiHelpCircle } from 'react-icons/fi';
import { IpfsGatewayConfig, ipfsUriToGatewayUrl } from '../../lib/util/ipfs';
import { Token } from '../../reducer/slices/collections';

interface TokenMediaProps extends Token {
  config: IpfsGatewayConfig;
  maxW?: string;
  maxH?: string;
  class?: string;
  cursor?: string;
  objectFit?: any; //ObjectFitProperty | undefined; Todo ObjectFitProperty not found
  onClick?: Function;
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
      <FiHelpCircle size="70px" />
    </Flex>
  );
}

export function TokenMedia(props: TokenMediaProps) {
  const src = ipfsUriToGatewayUrl(props.config, props.artifactUri);
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
        flex="1"
        maxWidth={props.maxW}
        maxHeight={props.maxH}
        style={{ objectFit: props.objectFit ?? 'cover', maxWidth: props.maxW, maxHeight: props.maxH ?? '50vh', cursor: props.cursor }}
        onClick={props.onClick as MouseEventHandler<HTMLImageElement>}
        onError={() => setErrored(true)}
      />
    );
  }

  if (/^video\/.*/.test(obj.type)) {
    return (
      <video
      preload="metadata"
        onClick={e => e.preventDefault()}
        onMouseEnter={e => e.currentTarget.play()}
        onMouseLeave={e => e.currentTarget.pause()}
        style={{ objectFit: props.objectFit ?? 'cover', maxWidth: props.maxW, maxHeight: props.maxH ?? '50vh', cursor: props.cursor }}
        onLoadedMetadata={e => {(e.target as HTMLVideoElement).currentTime = .05; }}
        muted
        controls
      >
        <source src={obj.url} type={obj.type} />
      </video>
    );
  }

  if (props.metadata.formats?.length) {
    if (
      props.metadata.formats[0].mimeType === 'model/gltf-binary' ||
      props.metadata.formats[0].mimeType === 'model/gltf+json'
    ) {
      return (
        <>
          <model-viewer
            auto-rotate
            rotation-per-second="30deg"
            camera-controls
            src={obj.url}
            class={props.class}
          ></model-viewer>
        </>
      );
    }
  }

  return <MediaNotFound />;
}
