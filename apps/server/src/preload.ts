import { contextBridge } from 'electron';

import { networkInterfaces } from 'os';

// Get the local IP address
const getLocalIP = (): string[] => {
  const nets = networkInterfaces();
  const results = {} as { [key: string]: string[] };

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]!) {
      // Skip over non-IPv4 and internal
      if (net.family === 'IPv4' && !net.internal) {
        if (!results[name]) {
          results[name] = [];
        }
        results[name].push(net.address);
      }
    }
  }

  return Object.values(results).flat();
};

contextBridge.exposeInMainWorld('variables', {
  addresses: getLocalIP(),
});
