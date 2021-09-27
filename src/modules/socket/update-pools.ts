import { RollSelectorForm } from "../roll-selector-form";
import type { Message } from ".";

export function updatePools(message: Message): void {
  switch (message.kind) {
    case "create":
      ffgDicePools.set(message.userId, message);
      break;
    case "update":
      const roll = ffgDicePools.get(message.userId);
      if (roll?.pool) roll.pool = message.pool;
      break;
    case "delete":
      ffgDicePools.delete(message.userId);
      break;
    case "listen":
      break;
  }
  // Re-render the selector form if it is open
  Object.values(ui.windows)
    .find(a => a instanceof RollSelectorForm)
    ?.render();
}
