import { IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { styled } from 'styled-components';

const Div = styled.div`
  position: relative;
  height: 20px;

  & > button {
    position: absolute;
    top: 5px;
    left: 5px;
  }
`;

export const GlobalBackButton: React.FC = () => {
  const isInElectron = !!(window as any)?.isInElectron?.();
  const url = window.location.href;

  if (!isInElectron) return null;

  // no icon on display page
  if (url.includes('/display')) return null;

  return (
    <Div>
      <IconButton onClick={() => (window as any).history.back()} color="primary">
        <ArrowBackIcon />
      </IconButton>
    </Div>
  );
};
