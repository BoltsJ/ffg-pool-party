import {
  renderRollBuilderHook,
  rollBuilderContextHook,
} from "./modules/roll-builder-hooks";
import { openSelectorForm } from "./modules/roll-selector-form";
import { queueMessage } from "./modules/socket/queueMessage";
import { socketHandler } from "./modules/socket/socketHandler";

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
  queueMessage({ kind: "connect", userId: game.userId! });
});

Hooks.on("getRollBuilderFFGHeaderButtons", rollBuilderContextHook);
Hooks.on("renderRollBuilderFFG", renderRollBuilderHook);
Hooks.on("closeRollBuilderFFG", () => {
  queueMessage({ kind: "delete", userId: game.userId! });
});
