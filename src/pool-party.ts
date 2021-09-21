import { openSelectorForm } from "./modules/roll-selector-form";
import { socketHandler, queueMessage } from "./modules/socket";

Hooks.once("init", () => {
  socket.on("module.ffg-pool-party", socketHandler);
  window.ffgDicePools = new Map();
  window.ffgMessageQueue = {
    message: undefined,
    sending: false,
    seq: 0,
  };
  window.ffgMessageSeq = new Map();
  //@ts-ignore
  game.modules.get("ffg-pool-party").api = {
    openSelectorForm: openSelectorForm,
  };
});

Hooks.on("ready", () => {
  socket.emit("module.ffg-pool-party", { kind: "delete", userId: game.userId });
});

Hooks.on("getRollBuilderFFGHeaderButtons", (app, buttons) => {
  if (!game.user?.isGM) return;
  const party_time = {
    label: "Share",
    class: "pool-party-share",
    icon: "fas fa-share-alt",
    onclick: () => {
      const users = game.users!.filter(u => u.active).map(u => u.id);
      queueMessage({
        kind: "create",
        userId: game.userId!,
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
  const spy_time: Application.HeaderButton = {
    label: "View",
    class: "pool-party-spy",
    icon: "fas fa-eye",
    onclick: () => {
      openSelectorForm();
      app.close();
    },
  };
  buttons.unshift(party_time, spy_time);
});

Hooks.on("renderRollBuilderFFG", (app, html) => {
  if (!game.user?.isGM) {
    queueMessage({
      kind: "create",
      members: game.users!.filter(u => u.active).map(u => u.id),
      userId: game.userId!,
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
      window.setTimeout(() => {
        queueMessage({
          kind: "update",
          userId: game.userId!,
          pool: { ...app.dicePool },
        });
      }, 10);
    });
});

Hooks.on("closeRollBuilderFFG", () => {
  queueMessage({ kind: "delete", userId: game.userId! });
});
