import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div<{
  columns: number;
}>`
    display: grid;
    grid-template-columns: ${({ columns }) => new Array(columns).fill('1fr').join(' ')};
    height: 100vh;
    overflow: hidden;
  }>`;

export const DisplayWrapper: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  React.useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      console.log('Keydown', e.key);
      if (e.key === 'Escape') {
        if (document.fullscreenElement) {
          console.log('In fullscreen. Existting fullscreen.');
          document.exitFullscreen();
        } else {
          console.log('Not fullscreen, closing.');
          window.close();
        }
        return;
      }

      // full screen
      if (e.key.toLowerCase() === 'f') {
        console.log('Toggling fullscreen');
        // check if is already full screen
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          document.documentElement.requestFullscreen();
        }
      }
    };

    document.addEventListener('keydown', listener);

    return () => {
      document.removeEventListener('keydown', listener);
    };
  }, []);
  const childrenCount = React.Children.count(children);
  return <Wrapper columns={childrenCount}>{children}</Wrapper>;
};
