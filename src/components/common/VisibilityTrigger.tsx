import React, { useEffect, useRef } from 'react';

// Based on https://github.com/olistic/react-use-visibility#readme MIT License
function isElementNearViewport(
  element: HTMLElement,
  allowedDistanceToViewport = 0
) {
  const {
    top,
    right,
    bottom,
    left,
    height,
    width
  } = element.getBoundingClientRect();

  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  const topCheck = top + height;
  const leftCheck = left + width;
  const bottomCheck = bottom - height;
  const rightCheck = right - width;

  return (
    topCheck >= -allowedDistanceToViewport &&
    leftCheck >= -allowedDistanceToViewport &&
    bottomCheck <= windowHeight + allowedDistanceToViewport &&
    rightCheck <= windowWidth + allowedDistanceToViewport
  );
}

/** Simple Cross Browser Visibility Trigger */
export const useVisibilityTrigger = (
  elementRef: { current: undefined | null | HTMLElement },
  onVisible: () => void,
  allowedDistanceToViewport = 0
) => {
  const hasTriggered = useRef(false);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (hasTriggered.current) {
        return;
      }
      if (!elementRef.current) {
        return;
      }

      if (
        !isElementNearViewport(elementRef.current, allowedDistanceToViewport)
      ) {
        return;
      }

      hasTriggered.current = true;
      onVisible();
    }, 100);
    return () => clearInterval(intervalId);
  }, [allowedDistanceToViewport, elementRef, onVisible]);

  return {
    reset: () => {
      hasTriggered.current = false;
    }
  };
};

export const VisibilityTrigger = ({
  onVisible,
  allowedDistanceToViewport
}: {
  onVisible: () => void;
  allowedDistanceToViewport?: number;
}) => {
  const divRef = useRef(null as null | HTMLDivElement);
  useVisibilityTrigger(divRef, onVisible, allowedDistanceToViewport ?? 0);

  return <div ref={divRef} />;
};
