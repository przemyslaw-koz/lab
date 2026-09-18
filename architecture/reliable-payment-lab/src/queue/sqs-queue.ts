import type { MessageQueue } from "./message-queue.js";
import {
    SQSClient,
    SendMessageCommand,
  } from "@aws-sdk/client-sqs";

export class SqsQueue implements MessageQueue {
    constructor(private readonly sqs: SQSClient, private readonly queueUrl: string) {}

    async send(message: unknown): Promise<void> {
        const command = new SendMessageCommand({
            QueueUrl: this.queueUrl,
            MessageBody: JSON.stringify(message),
        });

        await this.sqs.send(command);
    }
}