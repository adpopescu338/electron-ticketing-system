import React from 'react';
import { EventNames, FeUseDataReturnType, QItem, Queue, QueueDisplaySettings } from '@repo/types';
import { useSocket } from './useSocket';

export const useQueueData = (
  maxItemsToDisplay: QueueDisplaySettings['maxBoxesToDisplay'],
  queueName: string,
  displayingOnDashboard?: boolean
): FeUseDataReturnType => {
  const socket = useSocket(queueName);
  const [data, setData] = React.useState<Queue>({
    message: null,
    currentItems: [],
    nextItems: [],
  });

  React.useEffect(() => {
    if (!socket) return;

    socket.emit('joinQueue', queueName);

    const newItemEvent = 'update' satisfies EventNames;
    const nextItemAddedEvent = 'nextItemAdded' satisfies EventNames;

    console.log(`Adding socket listener for ${newItemEvent}`);

    socket.on(newItemEvent, (q: Queue) => {
      console.log(
        `Received data for ${newItemEvent} at ${new Date().toISOString()}. new current number is ${
          q.currentItems[0]?.number
        }`
      );
      const isTheSame =
        data.message?.text === q.message?.text &&
        data.currentItems[0]?.number === q.currentItems[0]?.number;
      if (isTheSame) {
        console.log('Data is the same, returning');
        return;
      }
      setData({
        ...q,
        currentItems: q.currentItems.slice(0, maxItemsToDisplay),
        // we only need to display next items on the dashboard
        ...(!displayingOnDashboard && { nextItems: [] }),
      });
    });

    if (displayingOnDashboard) {
      socket.on(nextItemAddedEvent, (nextItems: Queue['nextItems']) => {
        console.log(`Dashboard listener: Received data for ${nextItemAddedEvent}`);
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
  }, [socket, queueName, maxItemsToDisplay, displayingOnDashboard]);

  if (data.currentItems.length < maxItemsToDisplay) {
    const diff = maxItemsToDisplay - data.currentItems.length;
    const itemsToDisplay: Array<QItem | null> = [...data.currentItems];
    for (let i = 0; i < diff; i++) {
      itemsToDisplay.push(null);
    }

    console.log(
      'useQueueData::itemsToDisplay[0]?.number',
      itemsToDisplay?.[0]?.number,
      `at ${new Date().toISOString()}`
    );

    return {
      ...data,
      currentItems: itemsToDisplay,
    };
  }

  console.log(
    'useQueueData::data.currentItems[0]?.number',
    data.currentItems?.[0]?.number,
    `at ${new Date().toISOString()}`
  );

  return data;
};
