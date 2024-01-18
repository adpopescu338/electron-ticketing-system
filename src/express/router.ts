import { Router } from 'express';
import { getQueuesSettings } from '../libs/storage';

export const router = Router();

router.get('/q', (req, res) => {
  const queuesSettings = getQueuesSettings();
  res.json(queuesSettings);
});
