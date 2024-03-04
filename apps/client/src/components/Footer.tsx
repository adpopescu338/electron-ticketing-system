import styled from 'styled-components';
import { Typography, IconButton } from '@mui/material';
import swal from 'sweetalert';
import HelpIcon from '@mui/icons-material/Help';

const Container = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  padding: 10px;
`;

const onClick = () => {
  swal(
    'About',
    'Tick is a queue management system built by Alexandru Popescu as a sign of appreciation for the wonderful time spent at the Romanian Consulate in London.\n' +
      'For any questions or suggestions, please contact me at ad.popescu338@yahoo.com'
  );
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
