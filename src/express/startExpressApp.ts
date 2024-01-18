import { QueueManagerClass } from './../libs/Queue';
import { EventNames } from './../../types';
import express from 'express';
import path from 'path';
import http from 'http';
import { Server } from 'socket.io';
import { getQueuesSettings } from '../libs/storage';
import { router } from './router';
import { findSocketQueueName } from '../libs/findSocketQueueName';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const queuesSettings = getQueuesSettings();
const queueManager = new QueueManagerClass(queuesSettings, io);

io.on('connection', (socket) => {
  socket.on('joinQueue' satisfies EventNames, (queueName: string) => {
    const queueExists = queuesSettings.some((queue) => queue.name === queueName);
    if (!queueExists) {
      console.log('Queue does not exist', queueName);
      return;
    }

    socket.join(queueName);

    queueManager.emitUpdate(queueName, socket);
  });

  socket.on('sendNextReq' satisfies EventNames, (desk: number) => {
    const queueName = findSocketQueueName(socket);
    console.log('next', queueName, desk);
    queueManager.next(queueName, desk);
  });

  socket.on('messageSent' satisfies EventNames, (message: string) => {
    const queueName = findSocketQueueName(socket);
    console.log('message', queueName, message);
    queueManager.message(queueName, message);
  });
});

app.use(express.json());
app.use('/api', router);

const clientBuildPath = path.join(__dirname, '../../../client', 'build');

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
