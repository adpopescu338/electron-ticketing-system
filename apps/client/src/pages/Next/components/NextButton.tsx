import React from 'react';
import { EventNames, QueueDisplaySettings, SystemSettings } from '@repo/types';
import Button from '@mui/material/Button';
import styled from 'styled-components';
import { useSocket } from 'hooks/useSocket';
import swal from 'sweetalert';
import { isSwalNumberValid } from 'lib/isSwalNumberValid';
import { useSystemSettings } from 'hooks/useSystemSettings';

const WAIT_AFTER_CALL = 5 * 1000;

const Container = styled.div`
  padding-bottom: 20px;
  display: flex;
  justify-content: center;
  gap: 10px;
`;

const getNextNumber = (
  systemSettings: SystemSettings,
  currentNumber: number | null | undefined
) => {
  if (currentNumber === null || currentNumber === undefined) {
    return systemSettings.START_NUMBER;
  }

  if (currentNumber === systemSettings.MAX_NUMBER) {
    return systemSettings.START_NUMBER;
  }

  return currentNumber + 1;
};

export const NextButton: React.FC<{
  desk: number;
  queueSettings: QueueDisplaySettings;
  currentNumber: number | null | undefined;
}> = ({ desk, queueSettings }) => {
  const [disabled, setDisabled] = React.useState(false);
  const socket = useSocket(queueSettings.name);
  const [systemSettings, loading] = useSystemSettings();

  const handleNext = () => {
    socket!.emit('sendNextReq' satisfies EventNames, desk);
    setDisabled(true);

    setTimeout(() => {
      setDisabled(false);
    }, WAIT_AFTER_CALL);
  };

  const handleSpecificNumber = async () => {
    if (!queueSettings.isSequential) return;
    const number = await swal('Enter number to call', {
      content: {
        element: 'input' as const,

        attributes: {
          placeholder: 'Number',
          type: 'number',
        },
      },
      buttons: ['Cancel', 'Confirm'],
    });

    if (number === null) return;

    if (!isSwalNumberValid(number, systemSettings.START_NUMBER, systemSettings.MAX_NUMBER)) {
      await swal(
        'Invalid number',
        `Please enter a number between ${systemSettings.START_NUMBER} and ${systemSettings.MAX_NUMBER}`,
        'error'
      );
      return;
    }

    const intVal = Number(number);

    // yes, no
    const countShouldFollowFromThisNumber = await swal(
      `Should the count follow from ${number}?`,
      `Should number after ${number} be ${getNextNumber(systemSettings, intVal)}?`,
      {
        buttons: ['No', 'Yes'],
        closeOnClickOutside: false,
        closeOnEsc: false,
      }
    );

    socket!.emit(
      'callSpecificNumber' satisfies EventNames,
      desk,
      intVal,
      !countShouldFollowFromThisNumber
    );

    setDisabled(true);

    setTimeout(() => {
      setDisabled(false);
    }, WAIT_AFTER_CALL);
  };

  const buttonsDisabled = disabled || !desk || loading;

  return (
    <Container>
      {socket && (
        <>
          {queueSettings.isSequential && (
            <Button
              size="large"
              variant="outlined"
              onClick={handleSpecificNumber}
              disabled={buttonsDisabled}
            >
              Call a specific number
            </Button>
          )}
          <Button
            size="large"
            variant="contained"
            color="primary"
            onClick={handleNext}
            disabled={buttonsDisabled}
          >
            Next
          </Button>
        </>
      )}
    </Container>
  );
};
