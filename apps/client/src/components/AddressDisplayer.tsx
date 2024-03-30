import styled from 'styled-components';
import swal from 'sweetalert';
import LanIcon from '@mui/icons-material/Lan';
import { Button } from '@mui/material';

const Container = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
`;

export const AddressDisplayer: React.FC = () => {
  if (!('variables' in window)) return null;
  if (!('addresses' in window.variables)) return null;
  const { addresses } = window.variables;
  if (!addresses?.length) return null;

  const port = window.location.port;

  const onClick = () => {
    swal({
      title: 'How to connect from other devices',
      text:
        "Make sure you're connected to the same network and try the links below:\n" +
        addresses.map((a) => `http://${a}:${port}`).join('\n'),
    });
  };

  return (
    <Container>
      <Button color="primary" onClick={onClick} size="small">
        Connection info
        <LanIcon />
      </Button>
    </Container>
  );
};
