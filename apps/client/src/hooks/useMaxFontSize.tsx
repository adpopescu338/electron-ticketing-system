import React from 'react';

const computeFontSize = (htmlElement: HTMLElement): number => {
  let minSize = 1; // The minimum font size to start the search
  let maxSize = 1000; // An upper limit for the font size
  let finalFontSize = 10; // Start with an initial guess of 10px
  const initialWidth = htmlElement.offsetWidth;
  const initialHeight = htmlElement.offsetHeight;

  // Binary search to adjust the font size
  while (minSize <= maxSize) {
    const midSize = Math.floor((minSize + maxSize) / 2);
    htmlElement.style.fontSize = `${midSize}px`;

    if (htmlElement.scrollWidth > initialWidth || htmlElement.scrollHeight > initialHeight) {
      // If the size overflows, decrease maxSize
      maxSize = midSize - 1;
    } else {
      // If it fits, update finalFontSize and increase minSize
      finalFontSize = midSize;
      minSize = midSize + 1;
    }
  }

  // Fine-tuning: Decrease the font size if it is less than 10% bigger than the size found by binary search
  let fineTunedFontSize = finalFontSize;
  while ((fineTunedFontSize - finalFontSize) / finalFontSize > 0.1) {
    fineTunedFontSize--;
    htmlElement.style.fontSize = `${fineTunedFontSize}px`;

    if (htmlElement.scrollWidth <= initialWidth && htmlElement.scrollHeight <= initialHeight) {
      break; // If it fits, we found our font size
    }
  }

  if (fineTunedFontSize === 1) {
    console.error('useMaxFontSize: fineTunedFontSize is 1');
    console.log('htmlElement', htmlElement);
  } else {
    htmlElement.style.fontSize = fineTunedFontSize + 'px';
  }

  return fineTunedFontSize;
};

export const useMaxFontSize = <T extends HTMLElement>(
  valueToWatch?: unknown
): [React.RefObject<T>, number] => {
  const elem = React.useRef<T>(null);
  const [fontSize, setFontSize] = React.useState<number>(0);

  React.useEffect(() => {
    if (!elem.current) return;

    // trigger a re-render to update the font size
    setFontSize(computeFontSize(elem.current));
  }, [elem?.current?.offsetWidth, valueToWatch]);

  return [elem, fontSize];
};
