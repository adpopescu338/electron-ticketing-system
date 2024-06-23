import { useState, useEffect } from 'react';
import { Socket, io } from 'socket.io-client';
import { EventNames } from '@repo/types';

export const useSocket = (queueName?: string) => {
  const [socket, setSocket] = useState<Socket>();
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const newSocket = io();
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    if (queueName && socket) {
      socket.on('connect', () => {
        socket.emit('joinQueue' satisfies EventNames, queueName);
        setReady(true)
      });
    }
  }, [queueName, socket]);

  if (!ready) return;

  return socket;
};
