import { Router } from 'express';
import {
  addQueueSettings,
  getQueuesSettings,
  removeQueueSettings,
  updateQueueSettings,
  getSystemSettings,
  setSystemSettings,
} from '../libs/storage';
import { QueueDisplaySettings } from '../../types/QueueDisplaySettings';
import { QueueManager } from './../libs/Queue';
import { systemSettingsValidationSchema } from '../../client/src/lib/yup/systemSettingsValidationSchema';
import { queueSettingsValidationSchema } from '../../client/src/lib/yup/queueSettingsValidationSchema';
import storage from 'electron-json-storage';

export const router = Router();

router.get('/q', (req, res) => {
  const queuesSettings = getQueuesSettings();
  res.json(queuesSettings);
});

router.get('/audios', (req, res) => {
  // there are some issues with the directory path when running the app in dev mode vs when packaged
  // so for now we will just hardcode the mp3 file names
  // they're not dynamic anyway
  const files = ['1.mp3', '2.mp3', '3.mp3', '4.mp3', '5.mp3', '6.mp3', '7.mp3'];

  res.json(files);
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
    await queueSettingsValidationSchema.validate(data);
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

router.get('/system-settings', (req, res) => {
  res.json(getSystemSettings());
});

router.post('/system-settings', async (req, res) => {
  const data = req.body;

  try {
    await systemSettingsValidationSchema.validate(data);
    await setSystemSettings(data);
  } catch (e) {
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

    QueueManager.removeAllQueues();

    res.json({ success: true });
  });
});
