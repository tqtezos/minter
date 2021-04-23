import React, { useEffect, useRef } from "react";

// Based on https://github.com/olistic/react-use-visibility#readme MIT License
function isElementInDisplay(el: HTMLElement, partial = true) {
  
    const {
      top,
      right,
      bottom,
      left,
      width,
      height,
    } = el.getBoundingClientRect();
  
    if (!width) {
      return false;
    }
  
    const topCheck = partial ? top + height : top;
    const bottomCheck = partial ? bottom - height : bottom;
    const rightCheck = partial ? right - width : right;
    const leftCheck = partial ? left + width : left;
  
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
  
    return (
      topCheck >= 0 &&
      leftCheck >= 0 &&
      bottomCheck <= windowHeight &&
      rightCheck <= windowWidth
    );
}

/** Simple Cross Browser Visibility Trigger */
export const useVisibilityTrigger = (elementRef: { current: undefined | null | HTMLElement }, onVisible: () => void) => {

    const hasTriggered = useRef(false);

    useEffect(()=>{
        const intervalId = setInterval(() => {
            if(hasTriggered.current) { return; }
            if(!elementRef.current) { return; }

            if(!isElementInDisplay(elementRef.current)){ return; }

            hasTriggered.current = true;
            onVisible();
        }, 100);
        return () => clearInterval(intervalId);
    },[elementRef, onVisible]);

    return {
        reset: () => { hasTriggered.current = false; },
    };
};

export const VisibilityTrigger = ({ onVisible }: { onVisible: () => void }) => {

    const divRef = useRef(null as null | HTMLDivElement);
    useVisibilityTrigger(divRef, onVisible);

    return (
        <div ref={divRef} />
    );
}