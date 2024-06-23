import React from 'react';
import { createContext } from 'react';
import { QueueDisplaySettings } from '@repo/types';
import axios from 'axios';

export const Ctx = createContext<{
  queuesSettings: QueueDisplaySettings[];
  loadingQueuesSettings: boolean;
  refetchQueuesSettings: () => void;
}>({
  queuesSettings: [],
  loadingQueuesSettings: false,
  refetchQueuesSettings: () => {},
});

export const CtxProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [queuesSettings, setQueuesSettings] = React.useState<QueueDisplaySettings[]>([]);
  const [loadingQueuesSettings, setLoadingQueuesSettings] = React.useState(false);

  const fetchQueuesSettings = React.useCallback(() => {
    setLoadingQueuesSettings(true);
    axios
      .get('/api/q')
      .then((res) => {
        setQueuesSettings(res.data);
      })
      .finally(() => {
        setLoadingQueuesSettings(false);
      });
  }, []);

  React.useEffect(() => {
    fetchQueuesSettings();
  }, [fetchQueuesSettings]);

  return (
    <Ctx.Provider
      value={{ queuesSettings, refetchQueuesSettings: fetchQueuesSettings, loadingQueuesSettings }}
    >
      {children}
    </Ctx.Provider>
  );
};
