import styled from 'styled-components';
import { TextareaAutosize } from '@mui/base/TextareaAutosize';
import { IconButton } from '@mui/material';
import ScheduleSendIcon from '@mui/icons-material/ScheduleSend';
import { EventNames, FeUseDataReturnType } from '@repo/types';
import React from 'react';
import { useSocket } from 'hooks/useSocket';

const Container = styled.div`
  max-width: 700px;
  position: absolute;
  top: 50px;
  left: 10px;
  display: flex;
  flex-direction: column;
`;

export const SendMessage: React.FC<{
  queueName: string;
  queueData: FeUseDataReturnType;
  desk: string;
}> = ({ queueData, queueName, desk }) => {
  const ref = React.useRef<HTMLTextAreaElement>(null);
  const socket = useSocket(queueName);

  const handleSend = () => {
    if (!desk) {
      sweetAlert('Please set a desk number', '', 'error');
      return;
    }
    if (!socket) {
      sweetAlert('Socket not connected', '', 'error');
      return;
    }

    const message = ref.current!.value;

    if (!message) {
      sweetAlert('Please enter a message', '', 'error');
      return;
    }

    socket.emit('messageSent' satisfies EventNames, message, desk);
  };

  return (
    <Container>
      <TextareaAutosize ref={ref} placeholder="Send message to queue" minRows={5} maxRows={20} />
      <IconButton color="primary" disabled={!!queueData.message} onClick={handleSend}>
        <ScheduleSendIcon />
        Send
      </IconButton>
    </Container>
  );
};
