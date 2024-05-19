import { IconButton, Typography } from '@mui/material';
import styled from 'styled-components';
import EditIcon from '@mui/icons-material/Edit';
import { updateDesk } from '../utils';

// align to right
const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  justify-content: flex-end;
  padding-right: 10px;
`;

export const Desk: React.FC<{
  desk: string | null;
  setDesk: React.Dispatch<React.SetStateAction<string | null>>;
}> = ({ desk, setDesk }) => {
  return (
    <Container>
      <Typography variant="h4">Desk {desk}</Typography>
      <IconButton onClick={() => updateDesk(setDesk)} size="large" color="primary">
        <EditIcon />
      </IconButton>
    </Container>
  );
};
