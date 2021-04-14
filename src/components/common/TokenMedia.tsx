import React, { useEffect, useState } from 'react';
import { Flex, Image } from '@chakra-ui/react';
import { FiHelpCircle } from 'react-icons/fi';

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

export function TokenMedia(props: { src: string, maxW?: string, onLoad?: Function }) {
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
        height="100%"
        flex="1"
        style={{objectFit:"scale-down", maxWidth:props.maxW ?? '100%', maxHeight: '100%'}}
        onError={() => setErrored(true)}
        onLoad={()=> props.onLoad ? props.onLoad(obj.url, obj.type) : ''}
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
        onLoadedData={()=> props.onLoad ? props.onLoad(obj.url, obj.type) : ''}
        height="100%"
        style={{objectFit:"scale-down", maxWidth: props.maxW ?? '100%', maxHeight: '100%'}}
      >
        <source src={obj.url} type={obj.type} />
      </video>
    );
  }

  return <MediaNotFound />;
}
