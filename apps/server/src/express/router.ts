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
import fileUpload from 'express-fileupload';

export const router = Router();

router.use(fileUpload());

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

const audiosPath = (() => {
  const isDev = process.env.NODE_ENV === 'development';
  const paths = [getClientDir()]
  if (isDev) {
    paths.push("public")
  }
  paths.push("audio")
  let audiosPaths = path.join(...paths);
  if (isDev) {
    audiosPaths = audiosPaths.replace("/dist", "")
  }

  return audiosPaths;
})();

router.get('/audios', (req, res) => {


  fs.readdir(audiosPath, { encoding: "utf-8" }, (err, files) => {
    if (err) {
      console.error(err);
      res.status(500).json({ success: false, message: err.message });
    }

    res.json(files.filter((file) => file.endsWith('.mp3')))
  });
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

router.get('/q/:queueName', (req, res) => {
  const { queueName } = req.params;

  const queue = QueueManagers.get(queueName);
  if (!queue) {
    res.status(404).json({ success: false, message: 'Queue not found' });
    return;
  }

  res.json(queue.queue);
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

router.post('/audio', async (req, res) => {
  if (!req.files || !req.files.audio) {
    res.status(400).json({ success: false, message: 'No file uploaded' });
    return;
  }

  const audio = req.files.audio as fileUpload.UploadedFile;

  if (!audio.mimetype.startsWith('audio/')) {
    res.status(400).json({ success: false, message: 'Invalid file type' });
    return;
  }

  const fileName = audio.name;


  const filePath = path.join(audiosPath, fileName);

  audio.mv(filePath, (err) => {
    if (err) {
      res.status(500).json({ success: false, message: err.message });
      return;
    }

    res.json({ success: true });
  });

})

router.delete('/audio/:audioName', (req, res) => {
  const { audioName } = req.params;

  const filePath = path.join(audiosPath, audioName);

  fs.unlink(filePath, (err) => {
    if (err) {
      res.status(500).json({ success: false, message: err.message });
      return;
    }

    res.json({ success: true });
  });
});