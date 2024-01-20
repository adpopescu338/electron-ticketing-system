import styled from 'styled-components';
import { TextareaAutosize } from '@mui/base/TextareaAutosize';
import { IconButton } from '@mui/material';
import ScheduleSendIcon from '@mui/icons-material/ScheduleSend';
import { EventNames, FeUseDataReturnType } from '../../../../../types';
import React from 'react';
import { useSocket } from '../../../hooks/useSocket';

const Container = styled.div`
  max-width: 700px;
  position: absolute;
  top: 10px;
  left: 10px;
  display: flex;
  flex-direction: column;
`;

export const SendMessage: React.FC<{
  queueName: string;
  queueData: FeUseDataReturnType;
}> = ({ queueData, queueName }) => {
  const ref = React.useRef<HTMLTextAreaElement>(null);
  const socket = useSocket(queueName);

  const handleSend = () => {
    const message = ref.current!.value;
    socket!.emit('messageSent' satisfies EventNames, message);
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
