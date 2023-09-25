import { updatePools } from "./update-pools.mjs";
import { getRollBuilder } from "../get-roll-builder.mjs";

export async function socketHandler(message) {
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

async function receiveNewPool(message) {
  const user = game.users.get(message.userId);
  if (!user) throw Error("Invalid user");
  if (!user?.isGM) return;
  //await (await getRollBuilder())?.close();
  await game.ffg.DiceHelpers.displayRollDialog(
    message.data,
    new DicePoolFFG(message.pool),
    message.description,
    message.skill,
    message.item,
    message.flavor,
    message.sound
  );
  await new Promise(resolve => setTimeout(resolve, 50));
  const app = await getRollBuilder(10);
  if (!app) throw Error("Couldn't find roll builder window");
  app.shareUsers = new Set(message.members);
}

async function receivePoolUpdate(message) {
  const user = game.users.get(message.userId);
  if (!user) throw Error("Invalid user");
  const app = await getRollBuilder();
  if (!app || !app.shareUsers || !app.shareUsers.has(message.userId)) return;
  app.dicePool = new DicePoolFFG(message.pool);
  app._updatePreview(app.element);
  app._initializeInputs(app.element);
}

function receivePoolDelete(message) {
  const user = game.users.get(message.userId);
  if (!user) throw Error("Invalid user");
  const app = Object.values(ui.windows).find(a => a.hasOwnProperty("dicePool"));
  if (!app) return;
  if (app.shareUsers?.has(message.userId))
    app.shareUsers.delete(message.userId);
}

async function receiveListen(message) {
  const user = game.users.get(message.userId);
  if (!user) throw Error("Invalid user");
  if (message.target !== game.userId) return;
  const app = await getRollBuilder(10);
  if (!app) throw Error("Couldn't find roll builder window");
  if (!app.shareUsers) app.shareUsers = new Set();
  app.shareUsers.add(message.userId);
}
