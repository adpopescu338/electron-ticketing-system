"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findSocketQueueName = void 0;
const findSocketQueueName = (socket) => {
    const rooms = socket.rooms.keys();
    for (const room of rooms) {
        if (room !== socket.id) {
            return room;
        }
    }
    return null;
};
exports.findSocketQueueName = findSocketQueueName;
