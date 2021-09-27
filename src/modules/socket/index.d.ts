export interface UpdateMessage {
  kind: "update";
  seq?: number;
  userId: string;
  pool: DicePoolFFGSource;
}

export interface CreateMessage {
  kind: "create";
  seq?: number;
  userId: string;
  members: string[];
  data: RollBuilderFFG["roll"]["data"];
  pool: DicePoolFFGSource;
  description: string;
  skill?: string;
  item?: RollBuilderFFG["roll"]["item"];
  flavor?: string;
  sound?: string;
}

export interface DeleteMessage {
  kind: "delete";
  seq?: number;
  userId: string;
}

export interface ListenMessage {
  kind: "listen";
  seq?: number;
  userId: string;
  target: string;
}

export interface ConnectMessage {
  kind: "connect";
  seq?: undefined;
  userId: string;
}

export type Message =
  | UpdateMessage
  | CreateMessage
  | DeleteMessage
  | ListenMessage
  | ConnectMessage;
