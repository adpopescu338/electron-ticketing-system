import styled from 'styled-components';
import { Typography, IconButton } from '@mui/material';
import swal from 'sweetalert';
import HelpIcon from '@mui/icons-material/Help';

const Container = styled.div`
  bottom: 0;
  left: 0;
  padding: 10px;
`;

const text =
  'Tick is a queue management system built by Alexandru Popescu. It\'s free, open-source (available at https://github.com/adpopescu338/electron-ticketing-system) at it aims to be a versatile solution that can accommodate different queue setups';

const onClick = () => {
  swal('About', text);
};

export const Footer = () => {
  const url = window.location.href;

  // no icon on display page
  if (url.includes('/display')) return null;

  return (
    <Container>
      <Typography variant="caption" align="center">
        Tick - By Alexandru Popescu
      </Typography>

      <IconButton color="primary" onClick={onClick}>
        <HelpIcon />
      </IconButton>
    </Container>
  );
};
