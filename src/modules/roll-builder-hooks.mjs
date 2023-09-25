import { openSelectorForm } from "./roll-selector-form.mjs";
import { queueMessage } from "./socket/queue-message.mjs";

export function rollBuilderContextHook(...[app, buttons]) {
  if (!game.user?.isGM) return;
  const party_time = {
    label: "Share",
    class: "pool-party-share",
    icon: "fas fa-share-alt",
    onclick: () => {
      const users = game.users.filter(u => u.active).map(u => u.id);
      queueMessage({
        kind: "create",
        userId: game.userId,
        members: users,
        data: app.roll.data,
        pool: { ...app.dicePool },
        description: app.description,
        skill: app.roll.skillName,
        item: app.roll.item,
        flavor: app.roll.flavor,
        sound: app.roll.sound,
      });
      app.shareUsers = new Set(users);
    },
  };
  const spy_time = {
    label: "View",
    class: "pool-party-spy",
    icon: "fas fa-eye",
    onclick: () => {
      openSelectorForm();
      app.close();
    },
  };
  buttons.unshift(party_time, spy_time);
}

export function renderRollBuilderHook(...[app, html]) {
  if (!game.user?.isGM) {
    queueMessage({
      kind: "create",
      members: game.users.filter(u => u.active).map(u => u.id),
      userId: game.userId,
      data: app.roll.data,
      pool: { ...app.dicePool },
      description: app.description,
      skill: app.roll.skillName,
      item: app.roll.item,
      flavor: app.roll.flavor,
      sound: app.roll.sound,
    });
  }
  // Send updates to this dialog on the socket
  html
    .find(".pool-container,.pool-additional,.upgrade-buttons button")
    .on("click contextmenu", () => {
      queueMessage({
        kind: "update",
        userId: game.userId,
        pool: { ...app.dicePool },
      });
    });
}
