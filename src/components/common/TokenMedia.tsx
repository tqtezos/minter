import React, { useEffect, useState } from 'react';
import { Flex } from '@chakra-ui/react';
import { FiHelpCircle } from 'react-icons/fi';
import { useSelector } from '../../reducer';

function lazyLoad() {
    const lazyAssets = [].slice.call(document.querySelectorAll(".lazy"));
    if ("IntersectionObserver" in window) {
      let lazyObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            let lazyAsset = entry.target as HTMLImageElement | HTMLVideoElement;
            const s = lazyAsset.querySelector('source');
            if(!!s) {
              lazyAsset.src = (s.dataset.src) ?? '';
            } else {
              lazyAsset.src = (lazyAsset.dataset.src) ?? '';
            }
            lazyAsset.classList.remove("lazy");
            lazyObserver.unobserve(lazyAsset);
          }
        });
      });

      lazyAssets.forEach(function (lazyAsset) {
        lazyObserver.unobserve(lazyAsset);
        lazyObserver.observe(lazyAsset);
      });
    }
};

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
  const { marketplace, collections } = useSelector(s => s);
  if(marketplace.marketplace.loaded || collections.collections[collections.selectedCollection ?? ''].loaded) {
    lazyLoad();
  }
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
      <img
        className="lazy"
        data-src={obj.url}
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
        className="lazy"
        loop
        onClick={e => e.preventDefault()}
        onMouseEnter={e => e.currentTarget.play()}
        onMouseLeave={e => e.currentTarget.pause()}
        style={{ objectFit: "contain", width: '100%', height: "100%" }}
        onLoadedMetadata={() => { if (props.onLoad && obj?.url) { props.onLoad(obj.url, obj.type) } }}
      >
        <source data-src={obj.url} type={obj.type} />
      </video>
    );
  }

  return <MediaNotFound />;
}
