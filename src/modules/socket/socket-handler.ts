import { updatePools } from "./update-pools";
import type { RollBuilderFFG } from "../../types/rollbuilder";
import type {
  ConnectMessage,
  CreateMessage,
  DeleteMessage,
  ListenMessage,
  Message,
  UpdateMessage,
} from ".";

export async function socketHandler(message: Message): Promise<void> {
  const seq = ffgMessageSeq.get(message.userId) ?? -1;
  if ((message.seq ?? 0) <= seq && message.kind !== "connect") {
    console.warn(
      `Discarding out of sequece message from user ${message.userId}.
Expected n > ${seq}, got ${message.seq}.`
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
  let app: RollBuilderFFG | undefined = undefined;
  let max_tries = 100;
  while (!app && max_tries != 0) {
    await new Promise(resolve => setTimeout(resolve, 50)); // Sleep and try again
    max_tries -= 1;
    app = Object.values(ui.windows).find(a => a.hasOwnProperty("dicePool")) as
      | RollBuilderFFG
      | undefined;
  }
  if (!app) throw Error("Couldn't find roll builder window");
  app.shareUsers = new Set(message.members);
}

function receivePoolUpdate(message: UpdateMessage): void {
  const user = game.users!.get(message.userId);
  if (!user) throw Error("Invalid user");
  const app = Object.values(ui.windows).find(a =>
    a.hasOwnProperty("dicePool")
  ) as RollBuilderFFG | undefined;
  if (!app || !app.shareUsers || !app.shareUsers.has(message.userId)) return;
  console.log("Updating the pool");
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
