import type { MessageQueue } from "./message-queue.js";

export class FakeQueue implements MessageQueue {
  async send(message: unknown): Promise<void> {
    console.log("Received message to fake queue");
    console.log(message);
  }
}