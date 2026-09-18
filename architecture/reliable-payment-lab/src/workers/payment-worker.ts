import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } from "@aws-sdk/client-sqs";
import type { PaymentProvider } from "../provider/payment-provider.js";
import { FakePaymentProvider } from "../provider/fake-payment-provider.js";
import { pool } from "../db/pool.js";

const QUEUE_URL =
  "https://sqs.eu-north-1.amazonaws.com/567764214274/reliable-payment-requests";

export class PaymentWorker {
  constructor(private readonly sqs: SQSClient, private readonly provider: PaymentProvider) {}

  private receiveMessage = (queueUrl: string) =>
    this.sqs.send(
      new ReceiveMessageCommand({
        MessageSystemAttributeNames: [
          "SentTimestamp",
          "ApproximateReceiveCount",
        ],
        MaxNumberOfMessages: 1,
        MessageAttributeNames: ["All"],
        QueueUrl: queueUrl,
        WaitTimeSeconds: 20,
      }),
    );

  async processPaymentRequest(): Promise<void> {
    const { Messages } = await this.receiveMessage(QUEUE_URL);

    if (!Messages) {
      return;
    }

    if (Messages.length === 1) {
      const message = Messages[0];
      console.log({
        messageId: message.MessageId,
        receiptHandle: message.ReceiptHandle,
        receiveCount: message.Attributes?.ApproximateReceiveCount,
        body: message.Body,
      });

      const event = JSON.parse(message.Body!);

      const result = await pool.query(
        `
          SELECT id, amount, currency, status
          FROM payments
          WHERE id = $1
            AND status != 'CAPTURED'
        `,
        [event.payment_id],
      );

      if (result.rows.length === 0) {
        await this.sqs.send(
          new DeleteMessageCommand({
            QueueUrl: QUEUE_URL,
            ReceiptHandle: message.ReceiptHandle!,
          }),
        );

        return;
      }

      const payment = result.rows[0];

      await this.provider.capture({
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
      });

      await pool.query(
        `
          UPDATE payments
          SET status = 'CAPTURED',
              updated_at = NOW()
          WHERE id = $1
        `,
        [payment.id],
      );

      await this.sqs.send(
        new DeleteMessageCommand({
          QueueUrl: QUEUE_URL,
          ReceiptHandle: message.ReceiptHandle!,
        }),
      );
    }
  }
}

const worker = new PaymentWorker(
  new SQSClient({
    region: "eu-north-1",
  }),
  new FakePaymentProvider(),
);

await worker.processPaymentRequest();
