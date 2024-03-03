import { QueueDisplaySettings, QItem, SystemSettings } from '@repo/types';
export declare const getQueuesSettings: () => QueueDisplaySettings[];
export declare const QueueNames: Set<string>;
type QueuesStates = {
    [queueName: string]: QItem[];
};
export declare const getQueuesState: () => QueuesStates;
export declare const setQueueState: (queueName: string, items: QItem[]) => Promise<void>;
export declare const getQueueState: (queueName: string) => QItem[];
export declare const getSystemSettings: () => SystemSettings;
export declare const addQueueSettings: (queueSettings: QueueDisplaySettings) => Promise<void>;
export declare const updateQueueSettings: (queueSettings: QueueDisplaySettings) => Promise<void>;
export declare const removeQueueSettings: (queueName: string) => Promise<void>;
export declare const setSystemSettings: (settings: SystemSettings) => Promise<void>;
export {};
//# sourceMappingURL=storage.d.ts.map