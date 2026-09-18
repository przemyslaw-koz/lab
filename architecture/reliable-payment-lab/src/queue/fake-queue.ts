// fake-queue.ts

import type { MessageQueue, SendResult } from "./message-queue.js";

export class FakeQueue implements MessageQueue {
  async send(message: unknown): Promise<SendResult> {
    console.log("Received message to fake queue");
    console.log(message);

    return {
      success: true,
      message: "Message sent to fake queue",
    };
  }
}