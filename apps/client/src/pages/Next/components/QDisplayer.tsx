import styled from 'styled-components';
import {
  DeleteIncomingItemPayload,
  EventNames,
  FeUseDataReturnType,
  QItem,
  QMessage,
  QueueDisplaySettings,
} from '@repo/types';
import { useQueueData } from 'hooks/useQueueData';
import { Typography, Button } from '@mui/material';
import { useSocket } from 'hooks/useSocket';
import CancelIcon from '@mui/icons-material/Cancel';

const Container = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: space-evenly;
  padding: 10px;
  flex-wrap: wrap;
`;

export const QDisplayer: React.FC<{
  settings: QueueDisplaySettings;
  queueData: FeUseDataReturnType;
  currentDesk: string | null;
}> = ({ settings, currentDesk }) => {
  const data = useQueueData(settings, settings.name, true);

  return (
    <Container>
      <QueueDisplayer
        currentDesk={currentDesk}
        items={data.currentItems}
        message={data.message}
        settings={settings}
      />
      <QueueDisplayer
        currentDesk={currentDesk}
        items={data.nextItems}
        message={data.message}
        incoming
        settings={settings}
      />
    </Container>
  );
};

const QueueContainer = styled.div<{
  hide?: boolean;
  displayMessage?: boolean;
}>`
  opacity: ${({ hide }) => (hide ? 0 : 1)};
  width: 320px;
  padding: 0 10px 10px 10px;
  height: 300px;
  box-shadow: 0 0 5px 0 black;
  border-radius: 5px;
  display: flex;
  gap: 5px;
  flex-direction: column;
  font-size: 3.5rem;
  text-align: center;
  ${({ displayMessage }) =>
    displayMessage &&
    `justify-content: center;
  padding-top: 10px;
  padding-bottom: 10px;
  `}
  overflow-y: auto;
`;

const Row = styled.div<{ highlight: boolean }>`
  display: flex;
  justify-content: space-between;
  padding: 10px;
  background-color: ${({ highlight }) => (highlight ? '#fff3cf' : 'transparent')};
  border-radius: 5px;
  border: 1px solid #000;
  word-break: break-all;
  position: relative;
`;

const deleteItemStyles = {
  position: 'absolute',
  top: 'calc(50% - 18px)',
  right: 'calc(50% - 60px)',
  opacity: 0.1,
  transition: 'opacity 0.3s',
  '&:hover': {
    opacity: 1,
  },
} as const;

const DeleteItem: React.FC<{
  handleDelete: (payload: DeleteIncomingItemPayload) => void;
  itemOrMessage: QMessage | QItem;
}> = ({ handleDelete, itemOrMessage }) => {
  const onClick = () =>
    handleDelete({
      itemId: 'text' in itemOrMessage ? null : itemOrMessage.id,
      messageId: 'text' in itemOrMessage ? itemOrMessage.id : null,
    });

  return (
    <Button
      onClick={onClick}
      color="error"
      sx={deleteItemStyles}
      endIcon={<CancelIcon />}
      variant="contained"
    >
      Remove
    </Button>
  );
};

const QueueDisplayer: React.FC<{
  items: FeUseDataReturnType['currentItems'] | FeUseDataReturnType['nextItems'];
  message?: FeUseDataReturnType['message'];
  currentDesk?: string | null;
  incoming?: boolean;
  settings: QueueDisplaySettings;
}> = ({ items, incoming, message, currentDesk, settings }) => {
  const title = incoming ? 'Incoming' : 'Current';
  const socket = useSocket(settings.name);

  const handleDelete = async (payload: DeleteIncomingItemPayload) => {
    if (!socket) return console.error('Socket not initialized');

    socket.emit('deleteIncomingItem' satisfies EventNames, payload);
  };

  if (!incoming && message?.displayedAt) {
    return (
      <QueueContainer>
        <Typography variant="h4" textAlign="center">
          {title}
        </Typography>
        <Typography textAlign="center">Message sent by {message.desk}</Typography>
        <Row highlight={currentDesk === message.desk} style={{ justifyContent: 'center' }}>
          {message.text}
        </Row>
      </QueueContainer>
    );
  }

  return (
    <QueueContainer>
      <Typography variant="h4" textAlign="center">
        {title}
      </Typography>
      {incoming && message && message.desk === currentDesk && !message.displayedAt && (
        <Row highlight={currentDesk === message.desk}>
          <DeleteItem handleDelete={handleDelete} itemOrMessage={message} />
          <Typography variant="h6" textAlign="center">
            {message.text}
          </Typography>
          <Typography variant="h6" textAlign="center">
            {message.desk}
          </Typography>
        </Row>
      )}
      {items.map((item, i) => {
        if (item === null) {
          return (
            <Row highlight={false} key={`${i}`}>
              <span>-</span>
              <span>-</span>
            </Row>
          );
        }
        return (
          <Row
            highlight={currentDesk === item.desk}
            key={`${item.number}-${item.desk}-${item.createdAt}`}
          >
            {incoming && item.desk === currentDesk && (
              <DeleteItem handleDelete={handleDelete} itemOrMessage={item} />
            )}
            <span>{item.number}</span>
            <span>{item.desk}</span>
          </Row>
        );
      })}
    </QueueContainer>
  );
};
