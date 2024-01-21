import { EventNames, QItem, QMessage, Queues, SystemSettings } from '../../types';
import { getQueuesState, getSystemSettings, setQueueState } from './storage';
import { isNil } from 'lodash';
import { Server as Socket } from 'socket.io';
import { Socket as SocketType } from 'socket.io';

class QueueManagerCl {
  qs: Queues;
  settings: SystemSettings;
  socket: Socket;
  INTERVAL_MS = 1500;
  intervals: {
    [queueName: string]: NodeJS.Timeout;
  } = {};

  init(socket: Socket): void {
    this.socket = socket;
    this.settings = getSystemSettings();
    const queuesState = getQueuesState();

    this.qs = Object.entries(queuesState).reduce((acc, [queueName, currentItems]) => {
      acc[queueName] = {
        currentItems,
        nextItems: [],
        message: null,
      };
      return acc;
    }, {} as Queues);

    Object.keys(this.qs).forEach((queueName) => {
      this.intervals[queueName] = setInterval(() => {
        this.handleBackground(queueName);
      }, this.INTERVAL_MS);
    });
  }

  public addQueue(queueName: string): void {
    this.qs[queueName] = {
      currentItems: [],
      nextItems: [],
      message: null,
    };
    this.intervals[queueName] = setInterval(() => {
      this.handleBackground(queueName);
    }, this.INTERVAL_MS);
  }

  public removeQueue(queueName: string): void {
    delete this.qs[queueName];
    clearInterval(this.intervals[queueName]);
    delete this.intervals[queueName];
  }

  public async shutdown(): Promise<void> {
    Object.values(this.intervals).forEach((interval) => {
      clearInterval(interval);
    });

    await Promise.all(
      Object.entries(this.qs).map(([queueName, queue]) => {
        return setQueueState(queueName, queue.currentItems);
      })
    );
  }

  message(queueName: string, message: string): void {
    const queue = this.qs[queueName];
    if (!queue) return null;

    if (queue.message) {
      logger.debug('Queue::message:: Message already exists, not overwriting');
      return;
    }

    queue.message = {
      text: message,
      createdAt: Date.now(),
      displayedAt: null,
    };

    // let clients know that a message has been sent
    // so incoming messages are blocked
    this.emitUpdate(queueName);
  }

  private handleMessageEnd(queueName: string) {
    const q = this.qs[queueName];
    if (!q.currentItems.length && !q.nextItems.length) {
      logger.debug('Queue::handleMessageEnd:: No items in queue, keeping message');
      return;
    }
    delete this.qs[queueName].message;
    this.emitUpdate(queueName);
  }

  public next(queueName: string, desk: number): Promise<void> {
    const queue = this.qs[queueName];
    if (!queue) {
      logger.debug(`Queue::next:: Queue ${queueName} not found in ${Object.keys(this.qs)}`);
      return null;
    }

    const { nextItems, currentItems } = queue;

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

    logger.debug(`Queue::next:: newItem, nr ${newItem.number}, desk: ${newItem.desk}`);

    nextItems.push(newItem);

    this.emitItemAdded(queueName, nextItems);
  }

  private findNextNonExemptItem(items: QItem[]): QItem | undefined {
    return items.find((item) => {
      if (item.exemptFromCount) return false;
      return true;
    });
  }

  public callSpecificNumber(
    queueName: string,
    desk: number,
    numberToCall: number,
    resetCountFromThis: boolean
  ): void {
    const queue = this.qs[queueName];
    if (!queue) return null;

    const { nextItems } = queue;

    const newItem: QItem = {
      number: numberToCall,
      desk,
      createdAt: Date.now(),
      displayedAt: null,
      exemptFromCount: resetCountFromThis,
    };

    logger.debug(
      `Queue::callSpecificNumber:: newItem, nr ${newItem.number}, desk: ${newItem.desk}`
    );

    nextItems.push(newItem);

    this.emitItemAdded(queueName, nextItems);
  }

  private handleBackground(queueName: string) {
    const { currentItems, message, nextItems } = this.qs[queueName];
    const [mostRecentItem] = currentItems;

    if (message) {
      if (message.displayedAt === null) {
        logger.debug('Queue::handleBackground:: Message found but not displayed yet');
        // a message was added, but it hasn't been displayed yet
        // check if the most recent item has completed its display time

        if (mostRecentItem && this.displayTimePassed(mostRecentItem)) {
          logger.debug(
            'Queue::handleBackground:: Most recent item display time passed, time to display the message'
          );

          message.displayedAt = Date.now();

          this.emitUpdate(queueName);
          return;
        } else {
          logger.debug(
            'Queue::handleBackground:: Most recent item display time not passed, waiting for it to pass'
          );
        }
      }

      if (this.displayTimePassed(message)) {
        logger.debug('Queue::handleBackground:: Message display time passed');
        this.handleMessageEnd(queueName);
      } else {
        logger.debug('Queue::handleBackground:: Message display time not passed');
        // no need to do anything, it will resume in the next iteration
        return;
      }
    }

    if (mostRecentItem) {
      logger.debug('Queue::handleBackground:: Most recent item found');
      if (!this.displayTimePassed(mostRecentItem)) {
        logger.debug('Queue::handleBackground:: Most recent item display time not passed');
        return;
      }
    }

    if (nextItems.length) {
      logger.debug('Queue::handleBackground:: Next item found');
      // move next item to current items
      const itemToMoveFromNextToCurrent = nextItems.shift();
      itemToMoveFromNextToCurrent.displayedAt = Date.now();
      currentItems.unshift(itemToMoveFromNextToCurrent);
      this.resizeCurrentItems(queueName);
      this.emitUpdate(queueName);

      logger.debug('Queue::handleBackground:: Next item moved to current items');
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

  private safeNextNumber(prev: number | undefined) {
    if (isNil(prev)) {
      logger.debug(`Queue::safeNextNumber:: prev is nil, returning ${this.settings.START_NUMBER}`);
      return this.settings.START_NUMBER;
    }
    const newNumber = prev + 1;
    if (newNumber > this.settings.MAX_NUMBER) {
      logger.debug(
        'Queue::safeNextNumber:: newNumber > MAX_NUMBER',
        newNumber,
        `returning ${this.settings.START_NUMBER}`
      );
      return this.settings.START_NUMBER;
    }
    logger.debug('Queue::safeNextNumber:: newNumber', newNumber);
    return newNumber;
  }

  private resizeCurrentItems(queueName: string) {
    const { currentItems } = this.qs[queueName];
    if (currentItems.length > 10) {
      currentItems.splice(10);
    }
  }

  public emitUpdate(queueName: string, specificSocket?: SocketType): void {
    logger.debug(`Queue::emitUpdate, emitting update to ${queueName}`);
    if (specificSocket) {
      specificSocket.emit('update' satisfies EventNames, this.qs[queueName]);
      return;
    }

    this.socket.to(queueName).emit('update' satisfies EventNames, this.qs[queueName]);
  }

  private emitItemAdded(queueName: string, nextItems: QItem[]): void {
    logger.debug(`Queue::emitItemAdded, emitting itemAdded to ${queueName}`);
    this.socket.to(queueName).emit('nextItemAdded' satisfies EventNames, nextItems);
  }

  public removeAllQueues(): void {
    Object.keys(this.qs).forEach((queueName) => {
      this.removeQueue(queueName);
    });
  }
}

const logger = {
  debug: (...args: unknown[]) => {
    console.log(...args);
  },
};

export const QueueManager = new QueueManagerCl();
