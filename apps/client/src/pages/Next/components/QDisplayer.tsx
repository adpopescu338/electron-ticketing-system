import styled from 'styled-components';
import { FeUseDataReturnType, QueueDisplaySettings } from '@repo/types';
import { useQueueData } from '../../../hooks/useQueueData';
import { Typography } from '@mui/material';

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
  const data = useQueueData(settings.maxBoxesToDisplay, settings.name, true);

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

const Row = styled.div<{ highlight: boolean; center?: boolean }>`
  display: flex;
  justify-content: ${({ center }) => (center ? 'center' : 'space-between')};
  padding: 10px;
  background-color: ${({ highlight }) => (highlight ? '#fff3cf' : 'transparent')};
  border-radius: 5px;
  border: 1px solid #000;
`;

const shouldCenterRowContent = (settings: QueueDisplaySettings) => {
  if (settings.displayServer && !settings.displayNumber) return true;

  if (!settings.displayServer && settings.displayNumber) return true;

  return false;
};

const QueueDisplayer: React.FC<{
  items: FeUseDataReturnType['currentItems'] | FeUseDataReturnType['nextItems'];
  message?: FeUseDataReturnType['message'];
  currentDesk?: string | null;
  incoming?: boolean;
  settings: QueueDisplaySettings;
}> = ({ items, incoming, message, currentDesk, settings }) => {
  if (!incoming && message?.displayedAt) {
    return <QueueContainer displayMessage>{message.text}</QueueContainer>;
  }

  const title = incoming ? 'Incoming' : 'Current';
  const centerRowContent = shouldCenterRowContent(settings);

  return (
    <QueueContainer>
      <Typography variant="h4" textAlign="center">
        {title}
      </Typography>
      {incoming && message && !message.displayedAt && (
        <Row highlight={currentDesk === message.desk} center>
          <Typography variant="h6" textAlign="center">
            {message.text}
          </Typography>
        </Row>
      )}
      {items.map((item, i) => {
        if (item === null) {
          return (
            <Row highlight={false} key={`${i}`} center={centerRowContent}>
              {settings.displayNumber && <span>-</span>}
              {settings.displayServer && <span>-</span>}
            </Row>
          );
        }
        return (
          <Row
            highlight={currentDesk === item.desk}
            key={`${item.number}-${item.desk}-${item.createdAt}`}
            center={centerRowContent}
          >
            {settings.displayNumber && <span>{item.number}</span>}
            {settings.displayServer && <span>{item.desk}</span>}
          </Row>
        );
      })}
    </QueueContainer>
  );
};
