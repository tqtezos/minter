import React, { useEffect, useState } from 'react';
import { Flex, Image } from '@chakra-ui/react';
import { FiHelpCircle } from 'react-icons/fi';

document.addEventListener("DOMContentLoaded", function () {
  var lazyAssets = [].slice.call(document.querySelectorAll("img.lazy, video.lazy"));

  if ("IntersectionObserver" in window) {
    let lazyObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          let lazyAsset = entry.target as HTMLImageElement | HTMLVideoElement;
          lazyAsset.src = lazyAsset.dataset.src ?? "";
          lazyAsset.classList.remove("lazy");
          lazyObserver.unobserve(lazyAsset);
        }
      });
    });

    lazyAssets.forEach(function (lazyAsset) {
      lazyObserver.observe(lazyAsset);
    });
  }
});

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

export function TokenMedia(props: { src: string, maxW?: string, onLoad?: Function, height?: string }) {
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
        className="lazy"
        src={props.src}
        height={props.height ?? "100%"}
        flex="1"
        maxWidth={props.maxW}
        style={{ objectFit: "scale-down" }}
        onError={() => setErrored(true)}
        onLoad={() => props.onLoad ? props.onLoad(obj.url, obj.type) : ''}
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
        onLoadedData={() => props.onLoad ? props.onLoad(obj.url, obj.type) : ''}
        height={props.height ?? "100%"}
        style={{ objectFit: "scale-down", maxWidth: props.maxW ?? '100%', maxHeight: '100%' }}
      >
        <source src={obj.url} type={obj.type} />
      </video>
    );
  }

  return <MediaNotFound />;
}
