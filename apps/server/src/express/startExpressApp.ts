import { QueueManagers } from './../libs/Queue';
import { EventNames } from '@repo/types';
import express from 'express';
import path from 'path';
import http from 'http';
import { Server } from 'socket.io';
import { QueueNames } from '../libs/storage';
import { router, getClientDir } from './router';
import { findSocketQueueName } from '../libs/findSocketQueueName';

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

    const QueueManager = QueueManagers.get(queueName);

    QueueManager.emitUpdate(socket);
  });

  socket.on('sendNextReq' satisfies EventNames, (desk: number) => {
    const queueName = findSocketQueueName(socket);
    const QueueManager = QueueManagers.get(queueName);

    QueueManager.next(desk);
  });

  socket.on('messageSent' satisfies EventNames, (message: string) => {
    const queueName = findSocketQueueName(socket);
    const QueueManager = QueueManagers.get(queueName);
    QueueManager.message(message);
  });

  socket.on(
    'callSpecificNumber' satisfies EventNames,
    (desk: number, numberToCall: number, resetCountFromThis: boolean) => {
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

export const startExpressApp = (port: number): Promise<void> => {
  return new Promise<void>((resolve) => {
    console.log('Starting express app');

    server.listen(port, () => {
      console.log(`Express app listening on port ${port}!`);
      resolve();
    });
  });
};
