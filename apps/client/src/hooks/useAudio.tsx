import { useEffect, useRef } from 'react';

export const useAudio = (
  src: string,
  valueToWatch: unknown,
  cb?: () => void
) => {
  const audio = useRef(new Audio(`/audio/${src}`));

  useEffect(() => {
    audio.current = new Audio(`/audio/${src}`);
    audio.current.load();
  }, [src]);

  useEffect(() => {
    audio.current
      .play()
      .catch((e) => {
        console.warn('Failed to play audio. Please make sure to interact with the page first.', e);
      })
      .finally(() => {
        if (typeof cb === 'function') cb();
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valueToWatch]);
};
