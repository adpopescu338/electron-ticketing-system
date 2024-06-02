import styled from 'styled-components';
import { Typography, IconButton } from '@mui/material';
import swal from 'sweetalert';
import HelpIcon from '@mui/icons-material/Help';

const Container = styled.div`

  bottom: 0;
  left: 0;
  padding: 10px;
`;

const onClick = () => {
  swal(
    'About',
    'Tick is a queue management system built by Alexandru Popescu as the artifact for my final year Computing project at Arden University.\n' +
      'For any questions or suggestions, please contact me at stu98198@ardenuniversity.ac.uk'
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
