import storage from 'electron-json-storage';
import { QueueDisplaySettings, QItem, SystemSettings } from '../../types';
import { isEmpty } from 'lodash';

export const getQueuesSettings = (): QueueDisplaySettings[] => {
  // TODO: remove this
  return [
    {
      maxBoxesToDisplay: 4,
      displayTitle: true,
      color: 'white',
      backgroundColor: 'blue',
      borderColor: 'green',
      name: 'Pasapoarte',
      messageColor: 'yellow',
      messageBackgroundColor: 'blue',
      tableHeaderNumberText: 'Numar',
      tableHeaderDeskText: 'Ghiseu',
      messageAudioFileName: '1.mp3',
      numberAudioFileName: '2.mp3',
    },
    // {
    //   maxBoxesToDisplay: 3,
    //   displayTitle: false,
    //   color: 'white',
    //   backgroundColor: 'red',
    //   borderColor: 'green',
    //   name: 'Notariale',
    //   messageColor: 'white',
    //   messageBackgroundColor: 'green',
    //   tableHeaderNumberText: 'Nr.',
    //   tableHeaderDeskText: 'Gh.',
    // },
  ];
  const queuesSettings = storage.getSync('queues') as {
    queues: QueueDisplaySettings[];
  };

  if (isEmpty(queuesSettings)) {
    return [];
  }

  return queuesSettings.queues;
};

type QueuesStates = {
  [queueName: string]: QItem[];
};

export const getQueuesState = (queuesSettings: QueueDisplaySettings[]): QueuesStates => {
  return {
    Pasapoarte: [],
    Notariale: [],
  };
  const queuesStates = queuesSettings.reduce((acc, queue) => {
    const persistedItems = storage.getSync(queue.name) as {
      items: QItem[];
    };

    if (isEmpty(persistedItems)) {
      return acc;
    }

    acc[queue.name] = persistedItems.items;

    return acc;
  }, {} as QueuesStates);

  return queuesStates;
};

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
