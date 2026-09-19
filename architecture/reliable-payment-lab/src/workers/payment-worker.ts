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
    console.log(`📥 Worker: RECEIVING message`);
    const { Messages } = await this.receiveMessage(QUEUE_URL);
    const message = Messages?.[0];
    if (!message?.ReceiptHandle || !message.Body) {
      return;
    }

    const event = JSON.parse(message.Body);
    console.log(`📨 Worker: SELECTED ${event.payment_id}`);

    console.log(`🔄 Worker: UPDATING ${event.payment_id} to PROCESSING`);
    const result = await pool.query(
      `
      UPDATE payments
        SET status = 'PROCESSING'
        WHERE id = $1
          AND status = 'PENDING'
        RETURNING id, amount, currency, status;
      `,
      [event.payment_id],
    );

    const payment = result.rows[0] ?? null;

    if (!payment) {
      const existing = await pool.query(
        `
        SELECT id, status
        FROM payments
        WHERE id = $1
        `,
        [event.payment_id],
      );
    
      const currentPayment = existing.rows[0];
    
      if (currentPayment?.status === "CAPTURED") {
        console.log(`♻️ Worker: ${event.payment_id} already captured`);
        console.log(`🗑️ Worker: DELETING duplicate message`);
    
        await this.sqs.send(
          new DeleteMessageCommand({
            QueueUrl: QUEUE_URL,
            ReceiptHandle: message.ReceiptHandle,
          }),
        );
    
        return;
      }
    
      console.log(
        `⏸️ Worker: ${event.payment_id} not claimed, status=${currentPayment?.status}`,
      );
    
      return;
    }

    console.log(`💰 Worker: CAPTURING ${payment.id} via provider`);
    await this.provider.capture({
      id: payment.id,
      amount: payment.amount,
      currency: payment.currency,
    });

    console.log(`💾 Worker: UPDATING ${payment.id} in DB`);
    await pool.query(
      `
        UPDATE payments
        SET status = 'CAPTURED',
            updated_at = NOW()
        WHERE id = $1
      `,
      [payment.id],
    );

    // console.error(`💥 CRASH after DB update for ${payment.id}`);
    // process.exit(1);

    console.log(`🗑️ Worker: DELETING message ${payment.id}`);
    await this.sqs.send(
      new DeleteMessageCommand({
        QueueUrl: QUEUE_URL,
        ReceiptHandle: message.ReceiptHandle,
      }),
    );
  }
}

const worker = new PaymentWorker(
  new SQSClient({
    region: "eu-north-1",
  }),
  new FakePaymentProvider(),
);

await worker.processPaymentRequest();
