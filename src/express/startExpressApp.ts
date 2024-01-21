import { QueueManager } from './../libs/Queue';
import { EventNames } from './../../types';
import express from 'express';
import path from 'path';
import http from 'http';
import { Server } from 'socket.io';
import { QueueNames } from '../libs/storage';
import { router } from './router';
import { findSocketQueueName } from '../libs/findSocketQueueName';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

QueueManager.init(io);

io.on('connection', (socket) => {
  socket.on('joinQueue' satisfies EventNames, (queueName: string) => {
    const queueExists = QueueNames.has(queueName);
    if (!queueExists) {
      console.log('Queue does not exist', queueName);
      return;
    }

    socket.join(queueName);

    QueueManager.emitUpdate(queueName, socket);
  });

  socket.on('sendNextReq' satisfies EventNames, (desk: number) => {
    const queueName = findSocketQueueName(socket);
    QueueManager.next(queueName, desk);
  });

  socket.on('messageSent' satisfies EventNames, (message: string) => {
    const queueName = findSocketQueueName(socket);
    QueueManager.message(queueName, message);
  });

  socket.on(
    'callSpecificNumber' satisfies EventNames,
    (desk: number, numberToCall: number, resetCountFromThis: boolean) => {
      const queueName = findSocketQueueName(socket);
      QueueManager.callSpecificNumber(queueName, desk, numberToCall, resetCountFromThis);
    }
  );
});

app.use(express.json());
app.use('/api', router);

export const clientBuildPath = path.join(__dirname, '../../../client', 'build');

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
