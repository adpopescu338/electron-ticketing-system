export type QItem = {
  number: number;
  desk: string;
  createdAt: number;
  displayedAt: number | null;
  exemptFromCount?: boolean;
};

export type QMessage = {
  text: string;
  createdAt: number;
  displayedAt: number | null;
  desk: string;
};

export type Queue = {
  nextItems: Array<QItem>;
  message: QMessage | null;
  currentItems: Array<QItem>;
};

export type Queues = {
  [queueName: string]: Queue;
};
