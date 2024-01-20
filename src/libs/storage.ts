import storage from 'electron-json-storage';
import { QueueDisplaySettings, QItem, SystemSettings } from '../../types';
import { isEmpty } from 'lodash';

export const getQueuesSettings = (): QueueDisplaySettings[] => {
  const queuesSettings = storage.getSync('queues') as {
    queues: QueueDisplaySettings[];
  };

  if (isEmpty(queuesSettings)) {
    return [];
  }

  return queuesSettings.queues;
};

export const QueueNames = new Set<string>(getQueuesSettings().map((queue) => queue.name));

type QueuesStates = {
  [queueName: string]: QItem[];
};

export const getQueuesState = (): QueuesStates => {
  const queuesStates = [...QueueNames].reduce((acc, name) => {
    const persistedItems = storage.getSync(`queueState::${name}`) as {
      items: QItem[];
    };

    if (isEmpty(persistedItems)) {
      return acc;
    }

    acc[name] = persistedItems.items;

    return acc;
  }, {} as QueuesStates);

  return queuesStates;
};

export const setQueueState = (queueName: string, items: QItem[]): Promise<void> =>
  new Promise((resolve, reject) => {
    storage.set(`queueState::${queueName}`, { items }, (error) => {
      if (error) {
        reject(error);
      }

      resolve();
    });
  });

export const getQueueState = (queueName: string): QItem[] => {
  const persistedItems = storage.getSync(queueName) as {
    items: QItem[];
  };

  if (isEmpty(persistedItems)) {
    return [];
  }

  return persistedItems.items;
};

const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
  MESSAGE_DISPLAY_TIME_SECONDS: 10,
  Q_ITEM_DISPLAY_TIME_SECONDS: 10,
  MAX_NUMBER: 99,
  START_NUMBER: 0,
};

export const getSystemSettings = (): SystemSettings => {
  const settings = storage.getSync('systemSettings') as SystemSettings;

  if (isEmpty(settings)) return DEFAULT_SYSTEM_SETTINGS;

  return settings;
};

export const addQueueSettings = (queueSettings: QueueDisplaySettings): Promise<void> =>
  new Promise((resolve, reject) => {
    const queuesSettings = getQueuesSettings();

    const exists = queuesSettings.find((queue) => queue.name === queueSettings.name);

    if (exists) {
      reject(new Error('Queue already exists'));
    }

    queuesSettings.push(queueSettings);

    storage.set('queues', { queues: queuesSettings }, (error) => {
      if (error) {
        reject(error);
      }
      QueueNames.add(queueSettings.name);
      resolve();
    });
  });

export const updateQueueSettings = (queueSettings: QueueDisplaySettings): Promise<void> =>
  new Promise((resolve, reject) => {
    const queuesSettings = getQueuesSettings();

    const index = queuesSettings.findIndex((queue) => queue.name === queueSettings.name);

    queuesSettings[index] = queueSettings;

    storage.set('queues', { queues: queuesSettings }, (error) => {
      if (error) {
        reject(error);
      }

      resolve();
    });
  });

export const removeQueueSettings = (queueName: string): Promise<void> =>
  new Promise((resolve, reject) => {
    const queuesSettings = getQueuesSettings();

    const index = queuesSettings.findIndex((queue) => queue.name === queueName);

    queuesSettings.splice(index, 1);

    storage.set('queues', { queues: queuesSettings }, (error) => {
      if (error) {
        reject(error);
      }
      QueueNames.delete(queueName);
      resolve();
    });

    // not important to wait for this to finish
    storage.remove(`queueState::${queueName}`, (error) => {
      if (error) {
        console.error('removeQueueSettings::error', error);
      }
    });
  });
