import { QueueManagers } from './../libs/Queue';
import { EventNames } from '@repo/types';
import express from 'express';
import path from 'path';
import http from 'http';
import { Server } from 'socket.io';
import { QueueNames } from '../libs/storage';
import { router, getClientDir } from './router';
import { findSocketQueueName } from '../libs/findSocketQueueName';
import net from 'net';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

QueueManagers.init(io);

io.on('connection', (socket) => {
  socket.on('joinQueue' satisfies EventNames, (queueName: string) => {
    const queueExists = QueueNames.has(queueName);
    if (!queueExists) {
      console.log('Queue does not exist', queueName);
      return;
    }

    socket.join(queueName);
  });

  socket.on('sendNextReq' satisfies EventNames, (desk: string) => {
    const queueName = findSocketQueueName(socket);
    const QueueManager = QueueManagers.get(queueName);

    QueueManager.next(desk);
  });

  socket.on('messageSent' satisfies EventNames, (message: string, desk: string) => {
    const queueName = findSocketQueueName(socket);
    const QueueManager = QueueManagers.get(queueName);
    QueueManager.message(message, desk);
  });

  socket.on(
    'callSpecificNumber' satisfies EventNames,
    (desk: string, numberToCall: number, resetCountFromThis: boolean) => {
      const queueName = findSocketQueueName(socket);
      const QueueManager = QueueManagers.get(queueName);
      QueueManager.callSpecificNumber(desk, numberToCall, resetCountFromThis);
    }
  );
});

app.use(express.json());
app.use('/api', router);

const clientBuildPath = getClientDir();

// set cache headers for files in audio folder
app.use('/audio', (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=31557600');
  res.sendFile(path.join(clientBuildPath, 'audio', req.url));
});

// Serve static files from the React app
app.use(express.static(path.join(clientBuildPath)));

// All remaining requests return the React app, so it can handle routing.
app.use((req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

const isPortOpen = async (port: number): Promise<boolean> => {
  return new Promise((resolve) => {
    const s = net.createServer();
    s.once('error', (err) => {
      s.close();
      if ('code' in err && err.code == 'EADDRINUSE') {
        resolve(false);
      } else {
        resolve(false);
      }
    });
    s.once('listening', () => {
      resolve(true);
      s.close();
    });
    s.listen(port);
  });
};

const getNextOpenPort = async (startFrom: number) => {
  let openPort: number;
  while (startFrom < 65535 || !!openPort) {
    if (await isPortOpen(startFrom)) {
      return startFrom;
    }
    startFrom++;
  }

  throw new Error('No open port found');
};

/**
 * Start express app on given port. If port is already in use, it will use the next available port.
 * @param port
 * @returns
 */
export const startExpressApp = async (port: number): Promise<number> => {
  const nextOpenPort = await getNextOpenPort(port);

  if (port !== nextOpenPort) {
    console.warn(`Port ${port} is already in use. Using next available port ${nextOpenPort}`);
  }

  return new Promise<number>((resolve) => {
    console.log('Starting express app on port', nextOpenPort);

    server.listen(nextOpenPort, () => {
      console.log(`Express app listening on port ${nextOpenPort}!`);
      resolve(nextOpenPort);
    });
  });
};
