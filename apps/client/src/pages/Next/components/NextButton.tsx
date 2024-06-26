import React from 'react';
import { EventNames, FeUseDataReturnType, QueueDisplaySettings, SystemSettings } from '@repo/types';
import Button from '@mui/material/Button';
import styled from 'styled-components';
import { useSocket } from 'hooks/useSocket';
import swal from 'sweetalert2';
import { isSwalNumberValid } from 'lib/isSwalNumberValid';
import { useSystemSettings } from 'hooks/useSystemSettings';

const Container = styled.div`
  padding-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
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
  desk: string;
  queueSettings: QueueDisplaySettings;
  queueData: FeUseDataReturnType;
}> = ({ desk, queueSettings, queueData }) => {
  const [disabled, setDisabled] = React.useState(false);
  const socket = useSocket(queueSettings.name);
  const [systemSettings, loading] = useSystemSettings();

  const handleNext = () => {
    socket!.emit('sendNextReq' satisfies EventNames, desk);
    setDisabled(true);

    setTimeout(() => {
      setDisabled(false);
    }, systemSettings.Q_ITEM_DISPLAY_TIME_SECONDS * 1000);
  };

  const handleSpecificNumber = async () => {
    if (!queueSettings.displayNumber) return;
    const { value: number } = await swal.fire({
      title: 'Enter number to call',
      input: 'number',
      inputAttributes: {
        min: systemSettings.START_NUMBER + '',
        max: systemSettings.MAX_NUMBER + '',
      },
      showCancelButton: true,
      showConfirmButton: true,
    });

    if (number === null) return;

    if (!isSwalNumberValid(number, systemSettings.START_NUMBER, systemSettings.MAX_NUMBER)) {
      await swal.fire(
        'Invalid number',
        `Please enter a number between ${systemSettings.START_NUMBER} and ${systemSettings.MAX_NUMBER}`,
        'error'
      );
      return;
    }

    const intVal = Number(number);

    // yes, no
    const countShouldFollowFromThisNumber = await swal.fire({
      title: 'Should the count follow from this number?',
      icon: 'question',
      text: `Should number after ${number} be ${getNextNumber(systemSettings, intVal)}?`,
      showCancelButton: true,
      showConfirmButton: true,
      cancelButtonText: 'No',
      confirmButtonText: 'Yes',
      allowOutsideClick: false,
      allowEscapeKey: false,
    });

    socket!.emit(
      'callSpecificNumber' satisfies EventNames,
      desk,
      intVal,
      !countShouldFollowFromThisNumber
    );

    setDisabled(true);

    setTimeout(() => {
      setDisabled(false);
    }, systemSettings.Q_ITEM_DISPLAY_TIME_SECONDS * 1000);
  };

  const shouldButtonBeDisabled =
    disabled || !desk || loading || queueData.nextItems.some((item) => item.desk === desk);

  return (
    <Container>
      {socket && (
        <>
          {queueSettings.displayNumber && (
            <Button
              size="large"
              variant="outlined"
              onClick={handleSpecificNumber}
              disabled={shouldButtonBeDisabled}
            >
              Call a specific number
            </Button>
          )}
          <Button
            id="next-button"
            size="large"
            variant="contained"
            color="primary"
            onClick={handleNext}
            disabled={shouldButtonBeDisabled}
          >
            Next
          </Button>
        </>
      )}
    </Container>
  );
};
