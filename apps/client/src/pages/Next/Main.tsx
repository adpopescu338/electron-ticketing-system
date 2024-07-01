import React from 'react';
import { QueueDisplaySettings } from '@repo/types';
import { CircularProgress, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import { updateDesk } from './utils';
import { Desk, NextButton, QDisplayer, SendMessage } from './components';
import { useQueueData } from 'hooks/useQueueData';
import { useSocket } from 'hooks/useSocket';
import { useCtx } from 'hooks/useCtx';

const loadingContainerStyle = {
  width: '100%',
  height: '80vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

export const Next: React.FC = () => {
  const { queuesSettings, loadingQueuesSettings } = useCtx();
  const { queueName } = useParams();
  const queueSettings = queuesSettings.find((q) => q.name === queueName);

  if (!queueSettings || loadingQueuesSettings) {
    return (
      <div style={loadingContainerStyle}>
        {loadingQueuesSettings ? (
          <CircularProgress />
        ) : (
          <Typography variant="h5" color="error">
            Queue "{queueName}" not found
          </Typography>
        )}
      </div>
    );
  }

  return <DashboardWorker queueSettings={queueSettings} />;
};

const spinnerStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '90vh',
};

const Loading = () => {
  return (
    <div style={spinnerStyle}>
      <CircularProgress />
    </div>
  );
};

const dashboardWorkerContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
  paddingBottom: '50px',
} as const;

const DashboardWorker: React.FC<{ queueSettings: QueueDisplaySettings }> = ({ queueSettings }) => {
  const socket = useSocket(queueSettings.name);
  const [desk, setDesk] = React.useState<string | null>(null);
  const queueData = useQueueData(queueSettings, queueSettings.name, true);

  React.useEffect(() => {
    const localStorageDesk = localStorage.getItem('desk');

    if (localStorageDesk) {
      setDesk(localStorageDesk);
      return;
    }

    updateDesk(setDesk);
  }, []);

  if (!socket || !queueData || !desk) {
    return <Loading />;
  }

  return (
    <div id="next-page-container" style={dashboardWorkerContainerStyle}>
      <Desk desk={desk} setDesk={setDesk} />
      <NextButton desk={desk} queueSettings={queueSettings} queueData={queueData} />
      <QDisplayer settings={queueSettings} queueData={queueData} currentDesk={desk} />
      <SendMessage queueName={queueSettings.name} queueData={queueData} desk={desk} />
    </div>
  );
};
