import React, { useEffect, useRef, useState } from 'react';
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

export function TokenMedia(props: { src: string, srcThumbnail?: string, maxW?: string, onLoad?: Function, height?: string }) {
  const [errored, setErrored] = useState(false);
  const [obj, setObj] = useState<{ url: string; type: string } | null>(null);
  const loadingStateRef = useRef(null as null | 'thumbnail' | 'image' );
  const imageRef = useRef(null as null | HTMLImageElement );
  const videoRef = useRef(null as null | HTMLVideoElement );

  const loadImage = async(imageUrl: string, kind: 'thumbnail' | 'image')=>{
      if( kind === 'thumbnail' && loadingStateRef.current ) { return; }
      if( kind === 'image' && loadingStateRef.current !== 'thumbnail' ) { return; }

      console.log('loadImage START', { imageUrl, kind });

      loadingStateRef.current = kind;

      let blob;
      try {
        blob = await fetch(imageUrl).then(r => r.blob());
      } catch (e) {
        return setErrored(true);
      }
      setObj({
        url: URL.createObjectURL(blob),
        type: blob.type,
      });
  };
  
  const compRef = imageRef.current ?? videoRef.current;
  useEffect(() => {

    // Load thumbnail
    (async ()=>{
      if(props.srcThumbnail) {
        await loadImage(props.srcThumbnail, 'thumbnail');
      } else {
        await loadImage(props.src, 'image');
      }
    })();

    if(!compRef){ return; }

    let observer = new IntersectionObserver((e) => {
      console.log('IntersectionObserver', { e });
      if( !e[0].isIntersecting ) { return; }

      loadImage(props.src, 'image');
    }, {
      threshold: 0.05,
    });
    observer.observe(compRef);

    return () => observer.disconnect();
  }, [compRef, props.src, props.srcThumbnail]);

  if (errored) {
    return <MediaNotFound />;
  }

  if (!obj) return null;

  const onLoaded = ()=>{
    // loadIfOnScreen();

    if(props.onLoad) {
      props.onLoad(obj.url, obj.type);
    }
  };

  if (/^image\/.*/.test(obj.type)) {
    return (
      <Image
        ref={imageRef}
        className="lazy"
        src={obj.url}
        height={props.height ?? "100%"}
        flex="1"
        maxWidth={props.maxW}
        style={{ objectFit: "scale-down" }}
        onError={() => setErrored(true)}
        onLoad={onLoaded}
      />
    );
  }

  if (/^video\/.*/.test(obj.type)) {
    return (
      <video
        ref={videoRef}
        className="lazy"
        loop
        onClick={e => e.preventDefault()}
        onMouseEnter={e => e.currentTarget.play()}
        onMouseLeave={e => e.currentTarget.pause()}
        onLoadedData={onLoaded}
        height={props.height ?? "100%"}
        style={{ objectFit: "scale-down", maxWidth: props.maxW ?? '100%', maxHeight: '100%' }}
      >
        <source src={obj.url} type={obj.type} />
      </video>
    );
  }

  return <MediaNotFound />;
}
