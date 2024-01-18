import React from 'react';
import { EventNames } from '../../../../../types';
import Button from '@mui/material/Button';
import styled from 'styled-components';
import { useSocket } from '../../../lib/useSocket';

const WAIT_AFTER_CALL = 5 * 1000;

const Container = styled.div`
  text-align: center;
  padding-bottom: 20px;
`;

const StyledButton = styled(Button)`
  font-size: 30px;
`;

export const NextButton: React.FC<{
  desk: number | null;
  queueName: string;
}> = ({ desk, queueName }) => {
  const [disabled, setDisabled] = React.useState(false);
  const socket = useSocket(queueName);

  const handleNext = () => {
    socket!.emit('sendNextReq' satisfies EventNames, desk);
    setDisabled(true);

    setTimeout(() => {
      setDisabled(false);
    }, WAIT_AFTER_CALL);
  };

  return (
    <Container>
      {socket && (
        <StyledButton
          variant="contained"
          color="primary"
          onClick={handleNext}
          disabled={disabled || !desk}
        >
          Next
        </StyledButton>
      )}
    </Container>
  );
};
