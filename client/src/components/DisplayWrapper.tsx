import styled from 'styled-components';

export const DisplayWrapper = styled.div<{
  columns: number;
}>`
    display: grid;
    grid-template-columns: ${({ columns }) => new Array(columns).fill('1fr').join(' ')};
    height: 100vh;
    overflow: hidden;
  }>`;
