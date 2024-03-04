import styled from 'styled-components';

const GlobalContainerWrapper = styled.div`
  min-height: 100vh;
  position: relative;
`;

export const GlobalContainer: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return <GlobalContainerWrapper>{children}</GlobalContainerWrapper>;
};
