import { Router } from 'express';
import {
  addQueueSettings,
  getQueuesSettings,
  removeQueueSettings,
  updateQueueSettings,
  getSystemSettings,
  setSystemSettings,
} from '../libs/storage';
import { QueueDisplaySettings } from '@repo/types';
import { QueueManagers } from './../libs/Queue';
import { systemSettingsValidationSchema, queueSettingsValidationSchema } from '@repo/validation';
import storage from 'electron-json-storage';
import path from 'path';
import fs from 'fs';

export const router = Router();

export const getClientDir = () => {
  if (process.env.NODE_ENV === 'development') {
    return path.join(__dirname, '../../client/dist');
  }

  return __dirname;
};

router.get('/q', (req, res) => {
  const queuesSettings = getQueuesSettings();
  res.json(queuesSettings);
});

router.get('/audios', (req, res) => {
  // there are some issues with the directory path when running the app in dev mode vs when packaged
  // so for now we will just hardcode the mp3 file names
  // they're not dynamic anyway
  const files = fs.readdirSync(path.join(getClientDir(), 'public', 'audio'));

  res.json(files);
});

router.post('/q/_new', async (req, res) => {
  const data: QueueDisplaySettings = req.body;

  try {
    await addQueueSettings(data);
  } catch (e) {
    // @ts-expect-error
    if (e.message === 'Queue already exists') {
      // @ts-expect-error
      res.status(400).json({ success: false, message: e.message });
      return;
    }
    // @ts-expect-error
    res.status(500).json({ success: false, message: e.message });
    return;
  }

  QueueManagers.addQueue(data.name);

  res.json({ success: true });
});

router.post('/q/:queueName', async (req, res) => {
  const data: QueueDisplaySettings = req.body;

  try {
    await queueSettingsValidationSchema.validate(data);
    await updateQueueSettings(data);
  } catch (e) {
    // @ts-expect-error
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
    // @ts-expect-error
    res.status(500).json({ success: false, message: e.message });
    return;
  }

  QueueManagers.removeQueue(queueName);

  res.json({ success: true });
});

router.get('/system-settings', (req, res) => {
  res.json(getSystemSettings());
});

router.post('/system-settings', async (req, res) => {
  const data = req.body;

  try {
    await systemSettingsValidationSchema.validate(data);
    await setSystemSettings(data);
  } catch (e) {
    // @ts-expect-error
    res.status(500).json({ success: false, message: e.message });
    return;
  }

  res.json({ success: true });
});

router.delete('/all', (req, res) => {
  storage.clear((error) => {
    if (error) {
      res.status(500).json({ success: false, message: error.message });
      return;
    }

    QueueManagers.removeAllQueues();

    res.json({ success: true });
  });
});
