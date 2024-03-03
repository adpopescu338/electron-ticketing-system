import { useState, useEffect } from 'react';
import { Socket, io } from 'socket.io-client';
import { EventNames } from '@repo/types';

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
  }, []);

  return socket;
};
