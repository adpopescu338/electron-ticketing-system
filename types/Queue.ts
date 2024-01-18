export type QItem = {
  number: number;
  desk: number;
  createdAt: number;
  displayedAt: number | null;
};

export type QMessage = {
  text: string;
  createdAt: number;
  displayedAt: number | null;
};

export type Queue = {
  nextItems: Array<QItem>;
  message: QMessage | null;
  currentItems: Array<QItem>;
};

export type Queues = {
  [queueName: string]: Queue;
};
