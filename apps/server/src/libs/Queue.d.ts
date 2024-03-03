/// <reference types="node" />
import { Queues, SystemSettings } from '@repo/types';
import { Server as Socket } from 'socket.io';
import { Socket as SocketType } from 'socket.io';
declare class QueueManagerCl {
    qs: Queues;
    settings: SystemSettings;
    socket: Socket;
    INTERVAL_MS: number;
    intervals: {
        [queueName: string]: NodeJS.Timeout;
    };
    init(socket: Socket): void;
    addQueue(queueName: string): void;
    removeQueue(queueName: string): void;
    shutdown(): Promise<void>;
    message(queueName: string, message: string): void;
    private handleMessageEnd;
    next(queueName: string, desk: number): Promise<void>;
    private findNextNonExemptItem;
    callSpecificNumber(queueName: string, desk: number, numberToCall: number, resetCountFromThis: boolean): void;
    private handleBackground;
    private displayTimePassed;
    private safeNextNumber;
    private resizeCurrentItems;
    emitUpdate(queueName: string, specificSocket?: SocketType): void;
    private emitItemAdded;
    removeAllQueues(): void;
}
export declare const QueueManager: QueueManagerCl;
export {};
//# sourceMappingURL=Queue.d.ts.map