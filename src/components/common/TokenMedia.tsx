import React, { useState } from 'react';
import { Flex } from '@chakra-ui/react';
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

export function TokenMedia(props: { src?: string, maxW?: string, onLoad?: Function, height?: string }) {
  const [errored, setErrored] = useState(false);
  const [obj] = useState<{ url: string; type: string } | null>(null);
  // const { marketplace, collections } = useSelector(s => s);

  // useEffect(() => {
  //   (async () => {
  //     let blob;
  //     try {
  //       blob = await fetch(props.src).then(r => r.blob());
  //     } catch (e) {
  //       return setErrored(true);
  //     }
  //     setObj({
  //       url: URL.createObjectURL(blob),
  //       type: blob.type
  //     });
  //   })();
  // }, [props.src]);

  if (errored) {
    return <MediaNotFound />;
  }

  if (!obj) return null;

  if (/^image\/.*/.test(obj.type)) {
    return (
      <img
        className="lazy"
        style={{ objectFit: "scale-down", maxWidth: props.maxW ?? '100%', height: "100%"}}
        onError={() => setErrored(true)}
        alt=""
      />
    );
  }

  if (/^video\/.*/.test(obj.type)) {
    return (
      <video
        className="lazy"
        loop
        onClick={e => e.preventDefault()}
        onMouseEnter={e => e.currentTarget.play()}
        onMouseLeave={e => e.currentTarget.pause()}
        style={{ objectFit: "cover", width: '100%', height: "100%" }}
      >
        <source/>
      </video>
    );
  }

  return <MediaNotFound />;
}
