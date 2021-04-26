import React, { useEffect, useState } from 'react';
import { Flex } from '@chakra-ui/react';
import { FiHelpCircle } from 'react-icons/fi';
import { IpfsGatewayConfig, ipfsUriToGatewayUrl } from '../../lib/util/ipfs';
import { Token } from '../../reducer/slices/collections';

interface TokenMediaProps extends Token {
  config: IpfsGatewayConfig;
  maxW?: string;
  class?: string;
  onLoad?: Function;
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
      <img
        src={obj.url}
        style={{ objectFit: "scale-down", maxWidth: props.maxW ?? '100%', height: "100%"}}
        onError={() => setErrored(true)}
        onLoad={() => { if (props.onLoad && obj?.url) { props.onLoad(obj.url, obj.type) }; }}
        alt=""
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
        style={{ objectFit: "cover", width: '100%', height: "100%" }}
        onLoadedMetadata={() => { if (props.onLoad && obj?.url) { props.onLoad(obj.url, obj.type) } }}
      >
        <source src={obj.url} type={obj.type} />
      </video>
    );
  }

  if (props.metadata?.formats?.length) {
    if (props.metadata.formats[0].mimeType === 'model/gltf-binary' ||
      props.metadata.formats[0].mimeType === 'model/gltf+json'
    ) {
      return (
        <>
          <model-viewer
            auto-rotate
            rotation-per-second="30deg"
            src={obj.url}
            class={props.class}
          ></model-viewer>
        </>
      );
    }
  }

  return <MediaNotFound />;
}
