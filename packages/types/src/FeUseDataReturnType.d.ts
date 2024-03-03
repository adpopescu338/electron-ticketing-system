import { QItem, Queue } from './Queue';
export type FeUseDataReturnType = Omit<Queue, 'currentItems'> & {
    currentItems: Array<QItem | null>;
};
//# sourceMappingURL=FeUseDataReturnType.d.ts.map