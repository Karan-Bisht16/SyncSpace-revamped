export type Events = Record<string, EventHandler[]>;

export type EventHandler = (...args: any[]) => void;