import React, { useCallback, useEffect } from 'react';
import { EventNames, FeUseDataReturnType, QItem, Queue, QueueDisplaySettings } from '@repo/types';
import { useSocket } from './useSocket';
import axios from 'axios';

const initialValues: Queue = {
  message: null,
  currentItems: [],
  nextItems: [],
};

const shouldPlayMessageOrNewItemAudio = (newData: Queue, previousData: Queue) => {
  if (newData.message && newData.message.displayedAt && !previousData.message?.displayedAt) {
    return 'message';
  }

  if (newData.currentItems[0] && previousData.currentItems[0]) {
    if (newData.currentItems[0].id !== previousData.currentItems[0].id) {
      return 'newItem';
    }
  }

  return null;
};

export const useQueueData = (
  queueSettings: QueueDisplaySettings,
  queueName: string,
  /**
   *@description If true, an audio will play when a new item is added to the queue, or when a message is sent.
   * in addition, the next items will be stored in the state.
   * @default false
   */
  displayingOnDashboard = false
): FeUseDataReturnType => {
  const newItemAudioRef = React.useRef<HTMLAudioElement | null>(
    displayingOnDashboard ? null : new Audio(`/audio/${queueSettings.numberAudioFileName}`)
  );
  const messageAudioRef = React.useRef<HTMLAudioElement | null>(
    displayingOnDashboard ? null : new Audio(`/audio/${queueSettings.messageAudioFileName}`)
  );

  useEffect(() => {
    if (displayingOnDashboard) return;

    newItemAudioRef.current = new Audio(`/audio/${queueSettings.numberAudioFileName}`);
    messageAudioRef.current = new Audio(`/audio/${queueSettings.messageAudioFileName}`);
  }, [
    displayingOnDashboard,
    queueSettings.numberAudioFileName,
    queueSettings.messageAudioFileName,
  ]);

  const socket = useSocket(queueName);
  const [data, setData] = React.useState<Queue>(initialValues);

  const maxItemsToDisplay = queueSettings.maxBoxesToDisplay;

  const setDataFromServer = useCallback(
    (q: Queue) => {
      setData({
        ...q,
        currentItems: q.currentItems.slice(0, maxItemsToDisplay),
        // we only need to display next items on the dashboard
        ...(!displayingOnDashboard && { nextItems: [] }),
      });
    },
    [displayingOnDashboard, maxItemsToDisplay]
  );

  const playAudioIfNeeded = useCallback((newData: Queue) => {
    if (!newData) return;

    // get the previous data by using setData's callback
    // this way we can get the previous data without having to use a ref
    setData((previousData) => {
      const shouldPlayWhat = shouldPlayMessageOrNewItemAudio(newData, previousData);
      if (!shouldPlayWhat) return previousData;

      const refToPlay = shouldPlayWhat === 'newItem' ? newItemAudioRef : messageAudioRef;

      refToPlay.current?.play().catch((e) => {
        console.warn('Failed to play audio. Please make sure to interact with the page first.', e);
      });

      return previousData;
    });
  }, []);

  React.useEffect(() => {
    if (!socket) return;

    // load initial data
    axios
      .get<Queue>(`/api/q/${queueName}`)
      .then(({ data }): void => {
        setDataFromServer(data);
      })
      .catch(console.error);

    socket.emit('joinQueue' satisfies EventNames, queueName);

    const newItemEvent = 'update' satisfies EventNames;
    const nextItemAddedEvent = 'nextItemAdded' satisfies EventNames;

    console.log(`Adding socket listener for ${newItemEvent}`);

    socket.on(newItemEvent, (q: Queue) => {
      console.log(`Received data! for ${newItemEvent}`);
      playAudioIfNeeded(q);
      setDataFromServer(q);
    });

    if (displayingOnDashboard) {
      socket.on(nextItemAddedEvent, (nextItems: Queue['nextItems']) => {
        console.log(`Received data! for ${nextItemAddedEvent}`);
        setData((prev) => ({
          ...prev,
          nextItems,
        }));
      });
    }

    return () => {
      console.log(`Removing socket listener for ${newItemEvent}`);
      socket.off(newItemEvent);
      if (displayingOnDashboard) {
        socket.off(nextItemAddedEvent);
      }
    };
  }, [
    socket,
    queueName,
    maxItemsToDisplay,
    displayingOnDashboard,
    setDataFromServer,
    playAudioIfNeeded,
  ]);

  if (data.currentItems.length < maxItemsToDisplay) {
    const diff = maxItemsToDisplay - data.currentItems.length;
    const itemsToDisplay: Array<QItem | null> = [...data.currentItems];
    for (let i = 0; i < diff; i++) {
      itemsToDisplay.push(null);
    }

    return {
      ...data,
      currentItems: itemsToDisplay,
    };
  }

  return data;
};
