import { useState, useEffect } from 'react';
import { Socket, io } from 'socket.io-client';
import { EventNames } from '../../../types';

export const useSocket = (queueName?: string) => {
  const [socket, setSocket] = useState<Socket>();

  useEffect(() => {
    const newSocket = io();

    if (queueName) {
      newSocket.on('connect', () => {
        newSocket.emit('joinQueue' satisfies EventNames, queueName);
      });
    }

    setSocket(newSocket);
    return () => {
      newSocket.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return socket;
};
