import React from 'react';
import { createContext, useContext } from 'react';
import { QueueDisplaySettings } from '../../../types';
import axios from 'axios';

const Ctx = createContext<{
  queuesSettings: QueueDisplaySettings[];
  refetchQueuesSettings: () => void;
}>({
  queuesSettings: [],
  refetchQueuesSettings: () => {},
});

export const CtxProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [queuesSettings, setQueuesSettings] = React.useState<QueueDisplaySettings[]>([]);

  const fetchQueuesSettings = React.useCallback(() => {
    axios.get('/api/q').then((res) => {
      setQueuesSettings(res.data);
    });
  }, []);

  React.useEffect(() => {
    fetchQueuesSettings();
  }, []);

  return (
    <Ctx.Provider value={{ queuesSettings, refetchQueuesSettings: fetchQueuesSettings }}>
      {children}
    </Ctx.Provider>
  );
};

export const useCtx = () => {
  const ctx = useContext(Ctx);
  return ctx;
};
