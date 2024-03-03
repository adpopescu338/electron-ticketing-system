"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setSystemSettings = exports.removeQueueSettings = exports.updateQueueSettings = exports.addQueueSettings = exports.getSystemSettings = exports.getQueueState = exports.setQueueState = exports.getQueuesState = exports.QueueNames = exports.getQueuesSettings = void 0;
const storage = __importStar(require("electron-json-storage"));
const lodash_1 = require("lodash");
const constants_1 = require("@repo/constants");
const getQueuesSettings = () => {
    const queuesSettings = storage.getSync('queues');
    if ((0, lodash_1.isEmpty)(queuesSettings)) {
        return [];
    }
    return queuesSettings.queues;
};
exports.getQueuesSettings = getQueuesSettings;
exports.QueueNames = new Set((0, exports.getQueuesSettings)().map((queue) => queue.name));
const getQueuesState = () => {
    const queuesStates = [...exports.QueueNames].reduce((acc, name) => {
        const persistedItems = storage.getSync(`queueState::${name}`);
        const items = !Array.isArray(persistedItems === null || persistedItems === void 0 ? void 0 : persistedItems.items) ? [] : persistedItems.items;
        acc[name] = items;
        return acc;
    }, {});
    return queuesStates;
};
exports.getQueuesState = getQueuesState;
const setQueueState = (queueName, items) => new Promise((resolve, reject) => {
    storage.set(`queueState::${queueName}`, { items }, (error) => {
        if (error) {
            reject(error);
        }
        resolve();
    });
});
exports.setQueueState = setQueueState;
const getQueueState = (queueName) => {
    const persistedItems = storage.getSync(queueName);
    if ((0, lodash_1.isEmpty)(persistedItems)) {
        return [];
    }
    return persistedItems.items;
};
exports.getQueueState = getQueueState;
const getSystemSettings = () => {
    const settings = storage.getSync('systemSettings');
    if ((0, lodash_1.isEmpty)(settings)) {
        // save default settings
        storage.set('systemSettings', constants_1.DEFAULT_SYSTEM_SETTINGS, (error) => {
            if (error) {
                console.error('getSystemSettings::error', error);
            }
        });
        return constants_1.DEFAULT_SYSTEM_SETTINGS;
    }
    return settings;
};
exports.getSystemSettings = getSystemSettings;
const addQueueSettings = (queueSettings) => new Promise((resolve, reject) => {
    const queuesSettings = (0, exports.getQueuesSettings)();
    const exists = queuesSettings.find((queue) => queue.name === queueSettings.name);
    if (exists) {
        reject(new Error('Queue already exists'));
    }
    queuesSettings.push(queueSettings);
    storage.set('queues', { queues: queuesSettings }, (error) => {
        if (error) {
            reject(error);
        }
        exports.QueueNames.add(queueSettings.name);
        resolve();
    });
});
exports.addQueueSettings = addQueueSettings;
const updateQueueSettings = (queueSettings) => new Promise((resolve, reject) => {
    const queuesSettings = (0, exports.getQueuesSettings)();
    const index = queuesSettings.findIndex((queue) => queue.name === queueSettings.name);
    queuesSettings[index] = queueSettings;
    storage.set('queues', { queues: queuesSettings }, (error) => {
        if (error) {
            reject(error);
        }
        resolve();
    });
});
exports.updateQueueSettings = updateQueueSettings;
const removeQueueSettings = (queueName) => new Promise((resolve, reject) => {
    const queuesSettings = (0, exports.getQueuesSettings)();
    const index = queuesSettings.findIndex((queue) => queue.name === queueName);
    queuesSettings.splice(index, 1);
    storage.set('queues', { queues: queuesSettings }, (error) => {
        if (error) {
            reject(error);
        }
        exports.QueueNames.delete(queueName);
        resolve();
    });
    // not important to wait for this to finish
    storage.remove(`queueState::${queueName}`, (error) => {
        if (error) {
            console.error('removeQueueSettings::error', error);
        }
    });
});
exports.removeQueueSettings = removeQueueSettings;
const setSystemSettings = (settings) => new Promise((resolve, reject) => {
    storage.set('systemSettings', settings, (error) => {
        if (error) {
            reject(error);
        }
        resolve();
    });
});
exports.setSystemSettings = setSystemSettings;
