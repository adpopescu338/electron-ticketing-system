"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueManager = void 0;
const storage_1 = require("./storage");
const lodash_1 = require("lodash");
class QueueManagerCl {
    constructor() {
        this.INTERVAL_MS = 1500;
        this.intervals = {};
    }
    init(socket) {
        this.socket = socket;
        this.settings = (0, storage_1.getSystemSettings)();
        const queuesState = (0, storage_1.getQueuesState)();
        this.qs = Object.entries(queuesState).reduce((acc, [queueName, items]) => {
            acc[queueName] = {
                currentItems: items,
                nextItems: [],
                message: null,
            };
            return acc;
        }, {});
        Object.keys(this.qs).forEach((queueName) => {
            this.intervals[queueName] = setInterval(() => {
                this.handleBackground(queueName);
            }, this.INTERVAL_MS);
        });
    }
    addQueue(queueName) {
        this.qs[queueName] = {
            currentItems: [],
            nextItems: [],
            message: null,
        };
        this.intervals[queueName] = setInterval(() => {
            this.handleBackground(queueName);
        }, this.INTERVAL_MS);
    }
    removeQueue(queueName) {
        delete this.qs[queueName];
        clearInterval(this.intervals[queueName]);
        delete this.intervals[queueName];
    }
    shutdown() {
        return __awaiter(this, void 0, void 0, function* () {
            Object.values(this.intervals).forEach((interval) => {
                clearInterval(interval);
            });
            yield Promise.all(Object.entries(this.qs).map(([queueName, queue]) => {
                return (0, storage_1.setQueueState)(queueName, queue.currentItems);
            }));
        });
    }
    message(queueName, message) {
        const queue = this.qs[queueName];
        if (!queue)
            return null;
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
    handleMessageEnd(queueName) {
        const q = this.qs[queueName];
        if (!q.currentItems.length && !q.nextItems.length) {
            logger.debug('Queue::handleMessageEnd:: No items in queue, keeping message');
            return;
        }
        delete this.qs[queueName].message;
        this.emitUpdate(queueName);
    }
    next(queueName, desk) {
        var _a;
        const queue = this.qs[queueName];
        if (!queue) {
            logger.debug(`Queue::next:: Queue ${queueName} not found in ${Object.keys(this.qs)}`);
            return null;
        }
        const { nextItems, currentItems } = queue;
        const followingItem = (_a = this.findNextNonExemptItem([...nextItems].reverse())) !== null && _a !== void 0 ? _a : this.findNextNonExemptItem(currentItems);
        const newItem = {
            number: this.safeNextNumber(followingItem === null || followingItem === void 0 ? void 0 : followingItem.number),
            desk,
            createdAt: Date.now(),
            displayedAt: null,
            exemptFromCount: false,
        };
        logger.debug(`Queue::next:: newItem, nr ${newItem.number}, desk: ${newItem.desk}`);
        nextItems.push(newItem);
        this.emitItemAdded(queueName, nextItems);
    }
    findNextNonExemptItem(items) {
        return items.find((item) => {
            if (item.exemptFromCount)
                return false;
            return true;
        });
    }
    callSpecificNumber(queueName, desk, numberToCall, resetCountFromThis) {
        const queue = this.qs[queueName];
        if (!queue)
            return null;
        const { nextItems } = queue;
        const newItem = {
            number: numberToCall,
            desk,
            createdAt: Date.now(),
            displayedAt: null,
            exemptFromCount: resetCountFromThis,
        };
        logger.debug(`Queue::callSpecificNumber:: newItem, nr ${newItem.number}, desk: ${newItem.desk}`);
        nextItems.push(newItem);
        this.emitItemAdded(queueName, nextItems);
    }
    handleBackground(queueName) {
        const { currentItems, message, nextItems } = this.qs[queueName];
        const [mostRecentItem] = currentItems;
        if (message) {
            if (message.displayedAt === null) {
                logger.debug('Queue::handleBackground:: Message found but not displayed yet');
                // a message was added, but it hasn't been displayed yet
                // check if the most recent item has completed its display time
                if (mostRecentItem && this.displayTimePassed(mostRecentItem)) {
                    logger.debug('Queue::handleBackground:: Most recent item display time passed, time to display the message');
                    message.displayedAt = Date.now();
                    this.emitUpdate(queueName);
                    return;
                }
                else {
                    logger.debug('Queue::handleBackground:: Most recent item display time not passed, waiting for it to pass');
                }
            }
            if (this.displayTimePassed(message)) {
                logger.debug('Queue::handleBackground:: Message display time passed');
                this.handleMessageEnd(queueName);
            }
            else {
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
    displayTimePassed(itemOrMessage) {
        const { displayedAt } = itemOrMessage;
        if (!displayedAt)
            return false;
        const secondsToDisplay = 'text' in itemOrMessage
            ? this.settings.MESSAGE_DISPLAY_TIME_SECONDS
            : this.settings.Q_ITEM_DISPLAY_TIME_SECONDS;
        const passed = new Date(displayedAt).getTime() + secondsToDisplay * 1000 < Date.now();
        return passed;
    }
    safeNextNumber(prev) {
        if ((0, lodash_1.isNil)(prev)) {
            logger.debug(`Queue::safeNextNumber:: prev is nil, returning ${this.settings.START_NUMBER}`);
            return this.settings.START_NUMBER;
        }
        const newNumber = prev + 1;
        if (newNumber > this.settings.MAX_NUMBER) {
            logger.debug('Queue::safeNextNumber:: newNumber > MAX_NUMBER', newNumber, `returning ${this.settings.START_NUMBER}`);
            return this.settings.START_NUMBER;
        }
        logger.debug('Queue::safeNextNumber:: newNumber', newNumber);
        return newNumber;
    }
    resizeCurrentItems(queueName) {
        const { currentItems } = this.qs[queueName];
        if (currentItems.length > 10) {
            currentItems.splice(10);
        }
    }
    emitUpdate(queueName, specificSocket) {
        logger.debug(`Queue::emitUpdate, emitting update to ${queueName}`);
        if (specificSocket) {
            specificSocket.emit('update', this.qs[queueName]);
            return;
        }
        this.socket.to(queueName).emit('update', this.qs[queueName]);
    }
    emitItemAdded(queueName, nextItems) {
        logger.debug(`Queue::emitItemAdded, emitting itemAdded to ${queueName}`);
        this.socket.to(queueName).emit('nextItemAdded', nextItems);
    }
    removeAllQueues() {
        Object.keys(this.qs).forEach((queueName) => {
            this.removeQueue(queueName);
        });
    }
}
const logger = {
    debug: (...args) => {
        if (process.env.NODE_ENV === 'development')
            return;
        console.log(...args);
    },
};
exports.QueueManager = new QueueManagerCl();
