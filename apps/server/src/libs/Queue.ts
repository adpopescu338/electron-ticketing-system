import { EventNames, QItem, QMessage, Queue, Queues, SystemSettings } from '@repo/types';
import { getSystemSettings, setQueueState, QueueNames, getQueueState } from './storage';
import { isNil } from 'lodash';
import { Server as Socket } from 'socket.io';
import { Socket as SocketType } from 'socket.io';

class QueueManagerCl {
  queueName: string;
  queue: Queue;
  settings: SystemSettings;
  socket: Socket;
  logger: ReturnType<typeof createLogger>;
  timeout: NodeJS.Timeout;
  timeoutExpiresAt: number;
  private lastEmittedUpdateAt: number;

  constructor(queueName: string) {
    this.queueName = queueName;
    this.logger = createLogger(queueName);
    this.settings = getSystemSettings();
  }

  init(socket: Socket): void {
    this.socket = socket;
    const queueStateItems = getQueueState(this.queueName);

    this.queue = {
      currentItems: queueStateItems,
      nextItems: [],
      message: null,
    };
  }

  public removeQueue(): void {
    clearInterval(this.timeout);
    delete this.timeout;
  }

  public async shutdown(): Promise<void> {
    clearTimeout(this.timeout);

    await setQueueState(this.queueName, this.queue.currentItems);
  }

  public message(message: string, desk: number): void {
    const queue = this.queue;

    if (queue.message) {
      this.logger.debug('message:: Message already exists, not overwriting');
      return;
    }

    queue.message = {
      text: message,
      createdAt: Date.now(),
      displayedAt: null,
      desk,
    };

    // let clients know that a message has been sent
    // so incoming messages are blocked
    this.emitUpdate();
    this.handleBackground();
  }

  private handleMessageEnd() {
    const q = this.queue;
    if (!q.currentItems.length && !q.nextItems.length) {
      this.logger.debug('handleMessageEnd:: No items in queue, keeping message');
      return;
    }
    delete this.queue.message;
  }

  public next(desk: number): void {
    const { nextItems, currentItems } = this.queue;

    const followingItem =
      this.findNextNonExemptItem([...nextItems].reverse()) ??
      this.findNextNonExemptItem(currentItems);

    const newItem: QItem = {
      number: this.safeNextNumber(followingItem?.number),
      desk,
      createdAt: Date.now(),
      displayedAt: null,
      exemptFromCount: false,
    };

    this.logger.debug(`next:: newItem, nr ${newItem.number}, desk: ${newItem.desk}`);

    nextItems.push(newItem);

    this.emitItemAdded(nextItems);
    this.handleBackground();
  }

  private findNextNonExemptItem(items: QItem[]): QItem | undefined {
    return items.find((item) => {
      if (item.exemptFromCount) return false;
      return true;
    });
  }

  public callSpecificNumber(desk: number, numberToCall: number, resetCountFromThis: boolean): void {
    const { nextItems } = this.queue;

    const newItem: QItem = {
      number: numberToCall,
      desk,
      createdAt: Date.now(),
      displayedAt: null,
      exemptFromCount: resetCountFromThis,
    };

    this.logger.debug(`callSpecificNumber:: newItem, nr ${newItem.number}, desk: ${newItem.desk}`);

    nextItems.push(newItem);

    this.emitItemAdded(nextItems);
    this.handleBackground();
  }

  private handleBackground() {
    const { currentItems, message, nextItems } = this.queue;
    const [mostRecentItem] = currentItems;

    if (message) {
      if (message.displayedAt === null) {
        this.logger.debug('handleBackground:: Message found but not displayed yet');
        // a message was added, but it hasn't been displayed yet
        // check if the most recent item has completed its display time

        if (mostRecentItem && this.displayTimePassed(mostRecentItem)) {
          this.logger.debug(
            'handleBackground:: Most recent item display time passed, time to display the message'
          );

          message.displayedAt = Date.now();

          this.emitUpdate();
          this.setTimeout(message);
          return;
        } else {
          this.logger.debug(
            'handleBackground:: Most recent item display time not passed, waiting for it to pass'
          );
          this.setTimeout(mostRecentItem);
          return;
        }
      }

      if (this.displayTimePassed(message)) {
        this.logger.debug('handleBackground:: Message display time passed');
        this.handleMessageEnd();
        return this.handleBackground();
      } else {
        this.logger.debug('handleBackground:: Message display time not passed');
        // no need to do anything, it will resume in the next iteration
        this.setTimeout(message);
        return;
      }
    }

    if (mostRecentItem) {
      this.logger.debug('handleBackground:: Most recent item found');
      if (!this.displayTimePassed(mostRecentItem)) {
        this.logger.debug('handleBackground:: Most recent item display time not passed');
        this.setTimeout(mostRecentItem);
        return;
      }
    }

    if (nextItems.length) {
      this.logger.debug('handleBackground:: Next item found');
      // move next item to current items
      const itemToMoveFromNextToCurrent = nextItems.shift();
      itemToMoveFromNextToCurrent.displayedAt = Date.now();
      currentItems.unshift(itemToMoveFromNextToCurrent);
      this.resizeCurrentItems();
      this.emitUpdate();
      this.setTimeout(itemToMoveFromNextToCurrent);
      this.logger.debug('handleBackground:: Next item moved to current items');
    }
  }

  private displayTimePassed(itemOrMessage: QItem | QMessage) {
    const { displayedAt } = itemOrMessage;
    if (!displayedAt) return false;

    const secondsToDisplay =
      'text' in itemOrMessage
        ? this.settings.MESSAGE_DISPLAY_TIME_SECONDS
        : this.settings.Q_ITEM_DISPLAY_TIME_SECONDS;

    const passed = new Date(displayedAt).getTime() + secondsToDisplay * 1000 < Date.now();

    return passed;
  }

  private getTimeDiff(item: QItem | QMessage) {
    const { displayedAt } = item;
    if (!displayedAt) return null;
    return Date.now() - displayedAt;
  }

  private setTimeout(item: QItem | QMessage) {
    const timeDiff = this.getTimeDiff(item);
    if (timeDiff === null) {
      this.logger.debug('setTimeout:: timeDiff is null, returning');
      return;
    }

    const now = Date.now();

    if (this.timeoutExpiresAt > now && this.timeoutExpiresAt < now + timeDiff) {
      this.logger.debug('setTimeout:: there is already a closer timeout, returning');
      return;
    }

    if (this.timeout) {
      clearTimeout(this.timeout);
    }

    this.timeout = setTimeout(this.handleBackground.bind(this), timeDiff);
    this.timeoutExpiresAt = now + timeDiff;
  }

  private safeNextNumber(prev: number | undefined) {
    if (isNil(prev)) {
      this.logger.debug(`safeNextNumber:: prev is nil, returning ${this.settings.START_NUMBER}`);
      return this.settings.START_NUMBER;
    }
    const newNumber = prev + 1;
    if (newNumber > this.settings.MAX_NUMBER) {
      this.logger.debug(
        'safeNextNumber:: newNumber > MAX_NUMBER',
        newNumber,
        `returning ${this.settings.START_NUMBER}`
      );
      return this.settings.START_NUMBER;
    }
    this.logger.debug('safeNextNumber:: newNumber', newNumber);
    return newNumber;
  }

  private resizeCurrentItems() {
    const { currentItems } = this.queue;
    if (currentItems.length > 10) {
      currentItems.splice(10);
    }
  }

  public emitUpdate(specificSocket?: SocketType): void {
    this.logger.debug(`emitUpdate, emitting update. current item nr: ${this.queue.currentItems[0]?.number} at ${new Date().toISOString()}`);
    if (specificSocket) {
      specificSocket.emit('update' satisfies EventNames, this.queue);
      this.lastEmittedUpdateAt = Date.now();
      return;
    }

    this.socket.to(this.queueName).emit('update' satisfies EventNames, this.queue);
    this.lastEmittedUpdateAt = Date.now();
  }

  private emitItemAdded(nextItems: QItem[]): void {
    this.logger.debug(`emitItemAdded, emitting itemAdded`);
    this.socket.to(this.queueName).emit('nextItemAdded' satisfies EventNames, nextItems);
  }
}

const createLogger = (queueName: string) => {
  if (!queueName) throw new Error('Queue name is required');
  return {
    debug: (...args: unknown[]) => {
      if (process.env.NODE_ENV !== 'development') return;
      console.log(`Queue::[${queueName}]`, ...args);
    },
  };
};

class QueueManagersCl {
  private qm: Map<string, QueueManagerCl> = new Map();
  private socket: Socket;

  constructor() {
    for (const queueName of QueueNames) {
      const qm = new QueueManagerCl(queueName);
      this.qm.set(queueName, qm);
    }
  }

  init(io: Socket) {
    this.socket = io;
    for (const queueName of QueueNames) {
      this.qm.get(queueName).init(io);
    }
  }

  public get(queueName: string): QueueManagerCl {
    return this.qm.get(queueName);
  }

  public removeQueue(queueName: string): void {
    this.qm.get(queueName).removeQueue();
    this.qm.delete(queueName);
  }

  public removeAllQueues(): void {
    for (const qm of this.qm.values()) {
      qm.removeQueue();
    }
    this.qm.clear();
  }

  public addQueue(queueName: string): void {
    const qm = new QueueManagerCl(queueName);
    qm.init(this.socket);
    this.qm.set(queueName, qm);
  }

  public shutdown(): Promise<void[]> {
    const promises = [];
    for (const qm of this.qm.values()) {
      promises.push(qm.shutdown());
    }
    return Promise.all(promises);
  }
}

export const QueueManagers = new QueueManagersCl();
