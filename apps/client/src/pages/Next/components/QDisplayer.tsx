import styled from 'styled-components';
import { FeUseDataReturnType, QueueDisplaySettings } from '@repo/types';
import { useQueueData } from '../../../hooks/useQueueData';
import { Typography } from '@mui/material';

const Container = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  padding: 10px;
`;

export const QDisplayer: React.FC<{
  settings: QueueDisplaySettings;
  queueData: FeUseDataReturnType;
  currentDesk: number | null;
}> = ({ settings, currentDesk }) => {
  const data = useQueueData(settings.maxBoxesToDisplay, settings.name, true);

  return (
    <Container>
      <QueueContainer hide></QueueContainer>
      <QueueDisplayer
        currentDesk={currentDesk}
        items={data.currentItems}
        title="Current"
        message={data.message}
      />
      <QueueDisplayer currentDesk={currentDesk} items={data.nextItems} title="Incoming" />
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
`;

const QueueDisplayer: React.FC<{
  items: FeUseDataReturnType['currentItems'] | FeUseDataReturnType['nextItems'];
  title: string;
  message?: FeUseDataReturnType['message'];
  currentDesk?: number | null;
}> = ({ items, title, message, currentDesk }) => {
  if (message?.displayedAt) {
    return <QueueContainer displayMessage>{message.text}</QueueContainer>;
  }

  return (
    <QueueContainer>
      <Typography variant="h4" textAlign="center">
        {title}
      </Typography>
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
            <span>{item.number}</span>
            <span>{item.desk}</span>
          </Row>
        );
      })}
    </QueueContainer>
  );
};
