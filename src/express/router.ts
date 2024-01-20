import { Router } from 'express';
import { addQueueSettings, getQueuesSettings, removeQueueSettings, updateQueueSettings } from '../libs/storage';
import path from 'path';
import { readdirSync } from 'original-fs';
import { QueueDisplaySettings } from '../../types/QueueDisplaySettings';
import { QueueManager } from './../libs/Queue';

export const router = Router();

router.get('/q', (req, res) => {
  const queuesSettings = getQueuesSettings();
  res.json(queuesSettings);
});

router.get('/audios', (req, res) => {
  const audiosPath = path.join(__dirname, '../../../client', 'build', 'audio');

  const dirFiles = readdirSync(audiosPath).filter((file) => {
    return file.endsWith('.mp3');
  });

  res.json(dirFiles);
});

router.post('/q/_new', async (req, res) => {
  const data: QueueDisplaySettings = req.body;

  try {
    await addQueueSettings(data);
  } catch (e) {
    if (e.message === 'Queue already exists') {
      res.status(400).json({ success: false, message: e.message });
      return;
    }

    res.status(500).json({ success: false, message: e.message });
    return;
  }

  QueueManager.addQueue(data.name);

  res.json({ success: true });
});

router.post('/q/:queueName', async (req, res) => {
  const data: QueueDisplaySettings = req.body;

  try {
    await updateQueueSettings(data);
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
    return;
  }

  res.json({ success: true });
});

router.delete('/q/:queueName', async (req, res) => {
  const { queueName } = req.params;

  const queuesSettings = getQueuesSettings();

  const queueExists = queuesSettings.some((queue) => queue.name === queueName);
  if (!queueExists) {
    res.status(400).json({ success: false, message: 'Queue does not exist' });
    return;
  }

  try {
    await removeQueueSettings(queueName);
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
    return;
  }

  QueueManager.removeQueue(queueName);

  res.json({ success: true });
});
