import type { RollBuilderFFG } from "../types/rollbuilder";

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

export async function socketHandler(message: Message): Promise<void> {
  if (
    (message.seq ?? 0) <= (ffgMessageSeq.get(message.userId) ?? -1) &&
    message.kind !== "connect"
  ) {
    console.warn(
      `Discarding out of sequece message from user ${message.userId}`
    );
    return;
  }
  ffgMessageSeq.set(message.userId, message.seq ?? -1);
  if (game.user?.isGM) updatePools(message);
  switch (message.kind) {
    case "create":
      return receiveNewPool(message);
    case "update":
      return receivePoolUpdate(message);
    case "delete":
    case "connect":
      return receivePoolDelete(message);
    case "listen":
      return receiveListen(message);
  }
}

async function receiveNewPool(message: CreateMessage): Promise<void> {
  const user = game.users!.get(message.userId);
  if (!user) throw Error("Invalid user");
  if (!user?.isGM) return;
  await game.ffg.DiceHelpers.displayRollDialog(
    message.data,
    new DicePoolFFG(message.pool),
    message.description,
    message.skill,
    message.item,
    message.flavor,
    message.sound
  );
  setTimeout(() => {
    const app = Object.values(ui.windows).find(a =>
      a.hasOwnProperty("dicePool")
    ) as RollBuilderFFG | undefined;
    if (!app) return;
    app.shareUsers = new Set(message.members);
  }, 50);
}

function receivePoolUpdate(message: UpdateMessage): void {
  const user = game.users!.get(message.userId);
  if (!user) throw Error("Invalid user");
  const app = Object.values(ui.windows).find(a =>
    a.hasOwnProperty("dicePool")
  ) as RollBuilderFFG | undefined;
  if (!app || !app.shareUsers || !app.shareUsers.has(message.userId)) return;
  app.dicePool = new DicePoolFFG(message.pool);
  app._updatePreview(app.element);
  app._initializeInputs(app.element);
}

function receivePoolDelete(message: DeleteMessage | ConnectMessage): void {
  const user = game.users!.get(message.userId);
  if (!user) throw Error("Invalid user");
  const app = Object.values(ui.windows).find(a =>
    a.hasOwnProperty("dicePool")
  ) as RollBuilderFFG | undefined;
  if (!app) return;
  if (app.shareUsers?.has(message.userId))
    app.shareUsers.delete(message.userId);
}

function receiveListen(message: ListenMessage): void {
  const user = game.users!.get(message.userId);
  if (!user) throw Error("Invalid user");
  if (message.target !== game.userId) return;
  const app = Object.values(ui.windows).find(a =>
    a.hasOwnProperty("dicePool")
  ) as RollBuilderFFG | undefined;
  if (!app) return;
  if (!app.shareUsers) app.shareUsers = new Set();
  app.shareUsers.add(message.userId);
}

function updatePools(message: Message): void {
  switch (message.kind) {
    case "create":
      ffgDicePools.set(message.userId, message);
      return;
    case "update":
      const roll = ffgDicePools.get(message.userId);
      if (roll?.pool) roll.pool = message.pool;
      return;
    case "delete":
      ffgDicePools.delete(message.userId);
      return;
    case "listen":
      return;
  }
}

export function queueMessage(message: Message) {
  if (ffgMessageQueue.message) {
    switch (ffgMessageQueue.message.kind) {
      // If a create is queued, change the pool rather than replace it
      case "create":
        if (message.kind === "update") {
          ffgMessageQueue.message.pool = message.pool;
        } else {
          ffgMessageQueue.message = message;
        }
        break;
      // Immediately send the message and queue the new one
      case "listen":
      case "delete":
        sendQueuedMessage();
        ffgMessageQueue.message = message;
        return;
      default:
        ffgMessageQueue.message = message;
        break;
    }
  } else {
    ffgMessageQueue.message = message;
  }
  ffgMessageQueue.sending = true;
  // Rate limit the actual sending
  setTimeout(sendQueuedMessage, 100);
}

function sendQueuedMessage() {
  if (!ffgMessageQueue.sending) return;
  ffgMessageQueue.message!.seq = ffgMessageQueue.seq++;
  socket.emit("module.ffg-pool-party", ffgMessageQueue.message);
  ffgMessageQueue.message = undefined;
  ffgMessageQueue.sending = false;
}
