import styled from 'styled-components';
import TextField from '@mui/material/TextField';
import { IconButton } from '@mui/material';
import ScheduleSendIcon from '@mui/icons-material/ScheduleSend';
import { EventNames, FeUseDataReturnType } from '@repo/types';
import React from 'react';
import { useSocket } from 'hooks/useSocket';

const Container = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 10px;
`;

export const SendMessage: React.FC<{
  queueName: string;
  queueData: FeUseDataReturnType;
  desk: string;
}> = ({ queueData, queueName, desk }) => {
  const [message, setMessage] = React.useState('');
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

    if (!message) {
      sweetAlert('Please enter a message', '', 'error');
      return;
    }

    socket.emit('messageSent' satisfies EventNames, message, desk);
  };

  return (
    <Container>
      <TextField
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        label="Send message to queue"
        placeholder="Your message"
        minRows={5}
        multiline
        maxRows={20}
        fullWidth
        style={{
          minWidth: '280px',
          maxWidth: '600px',
        }}
      />
      <IconButton color="primary" disabled={!!queueData.message} onClick={handleSend}>
        <ScheduleSendIcon />
        Send
      </IconButton>
    </Container>
  );
};
