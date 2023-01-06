import { Message } from ".";

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
      case "connect":
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
  if (!ffgMessageQueue.sending || !ffgMessageQueue.message) return;
  ffgMessageQueue.message.seq = ffgMessageQueue.seq++;
  game.socket.emit("module.ffg-pool-party", ffgMessageQueue.message);
  ffgMessageQueue.message = undefined;
  ffgMessageQueue.sending = false;
}
