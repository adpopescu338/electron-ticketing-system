import { useEffect, useRef } from 'react';

export const useAudio = (
  src: string,
  valueToWatch: unknown,
  shouldPlay?: (valueToWatch: unknown) => boolean
) => {
  const audio = useRef(new Audio(`/audio/${src}`));

  useEffect(() => {
    audio.current = new Audio(`/audio/${src}`);
    audio.current.load();
  }, [src]);

  useEffect(() => {
    if (typeof shouldPlay === 'function') {
      if (!shouldPlay(valueToWatch)) return;
    }

    audio.current.play().catch(() => {
      console.warn('Failed to play audio. Please make sure to interact with the page first.');
    });
  }, [valueToWatch, shouldPlay]);
};
