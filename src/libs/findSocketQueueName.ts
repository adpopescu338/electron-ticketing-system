import { Socket } from 'socket.io';

export const findSocketQueueName = (socket: Socket): string | null => {
  const rooms = socket.rooms.keys();

  for (const room of rooms) {
    if (room !== socket.id) {
      return room;
    }
  }

  return null;
};
