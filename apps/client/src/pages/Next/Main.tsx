import React from 'react';
import { QueueDisplaySettings } from '@repo/types';
import { CircularProgress } from '@mui/material';
import { useParams } from 'react-router-dom';
import { updateDesk } from './utils';
import { Desk, NextButton, QDisplayer, SendMessage } from './components';
import { useQueueData } from 'hooks/useQueueData';
import { useSocket } from 'hooks/useSocket';
import { useCtx } from 'hooks/useCtx';

export const Next: React.FC = () => {
  const { queuesSettings } = useCtx();
  const { queueName } = useParams();
  const queueSettings = queuesSettings.find((q) => q.name === queueName);

  if (!queueSettings) {
    return <div>Queue not found</div>;
  }

  return <DashboardWorker queueSettings={queueSettings} />;
};

const DashboardWorker: React.FC<{ queueSettings: QueueDisplaySettings }> = ({ queueSettings }) => {
  const socket = useSocket(queueSettings.name);
  const [desk, setDesk] = React.useState<string | null>(null);
  const queueData = useQueueData(queueSettings.maxBoxesToDisplay, queueSettings.name, true);

  React.useEffect(() => {
    const localStorageDesk = localStorage.getItem('desk');

    if (localStorageDesk) {
      setDesk(localStorageDesk);
      return;
    }
    updateDesk(setDesk);
  }, []);

  if (!socket) return <CircularProgress />;
  if (!queueData) return <CircularProgress />;
  if (!desk) return <CircularProgress />;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        paddingBottom: '50px',
      }}
    >
      <Desk desk={desk} setDesk={setDesk} />
      <NextButton
        desk={desk}
        queueSettings={queueSettings}
        queueData={queueData}
      />
      <QDisplayer settings={queueSettings} queueData={queueData} currentDesk={desk} />
      <SendMessage queueName={queueSettings.name} queueData={queueData} desk={desk} />
    </div>
  );
};
