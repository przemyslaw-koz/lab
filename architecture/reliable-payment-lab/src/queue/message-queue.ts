interface MessageQueue {
    send(message: unknown): Promise<void>
  }