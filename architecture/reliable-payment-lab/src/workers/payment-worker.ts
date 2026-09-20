import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand, ChangeMessageVisibilityCommand } from "@aws-sdk/client-sqs";
import {
  type PaymentProvider,
  PermanentProviderError,
  RetryableProviderError,
  UnknownOutcomeError,
} from "../provider/payment-provider.js";
import { FakePaymentProvider } from "../provider/fake-payment-provider.js";
import { pool } from "../db/pool.js";
import { randomUUID } from "node:crypto";

const WORKER_ID = `payment-worker-${randomUUID()}`;
console.log(`👷 Worker: STARTED WITH ID ${WORKER_ID}`);

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

    private calculateBackoffSeconds(receiveCount: number): number {
      const baseDelaySeconds = 30;
      const maxDelaySeconds = 600;
    
      return Math.min(
        baseDelaySeconds * 2 ** (receiveCount - 1),
        maxDelaySeconds,
      );
    }

  async processPaymentRequest(): Promise<void> {
    console.log(`📥 Worker: RECEIVING message`);
    const { Messages } = await this.receiveMessage(QUEUE_URL);
    const message = Messages?.[0];
    if (!message?.ReceiptHandle || !message.Body) {
      console.log(`🔢 Worker: NO VISIBLE MESSAGE FOUND`);
      return;
    }

    const receiveCount = Number(
      message.Attributes?.ApproximateReceiveCount ?? "1",
    );
    
    console.log(`🔢 Worker: RECEIVE COUNT ${receiveCount}`);

    const event = JSON.parse(message.Body);
    console.log(`📨 Worker: SELECTED ${event.payment_id}`);

    console.log(`🔄 Worker: ATOMICALLY UPDATING ${event.payment_id} to PROCESSING`);
    const result = await pool.query(
      `
      UPDATE payments
        SET status = 'PROCESSING',
        lease_owner = $2,
        lease_until = NOW() + INTERVAL '30 seconds'
        WHERE id = $1
          AND (status = 'PENDING'
          OR (status = 'PROCESSING' AND lease_until < NOW()))
        RETURNING id, amount, currency, status, lease_until, lease_owner;
      `,
      [event.payment_id, WORKER_ID],
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
    console.log(
      `🔒 Worker: CLAIMED ${payment.id}, lease until ${payment.lease_until}`,
    );

    // console.error(`💥 CRASH just before payment capture for ${payment.id}`);
    // process.exit(1);

    console.log(`💰 Worker: CAPTURING ${payment.id} via provider`);

    try {
      await this.provider.capture({
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
      });
    } catch (error) {
      if (error instanceof RetryableProviderError) {
        // side effect na pewno NIE zaszedł
        // retry + exponential backoff

        console.error(
          `❌ Worker: RETRYABLE PROVIDER ERROR for ${payment.id}`,
          error,
        );

        const backoffSeconds = this.calculateBackoffSeconds(receiveCount);

        console.error(
          `❌ Worker: provider failed for ${payment.id}`,
          error,
        );

        console.log(
          `⏳ Worker: RETRY ${payment.id} in ${backoffSeconds}s ` +
            `(receive count=${receiveCount})`,
        );

        await this.sqs.send(
          new ChangeMessageVisibilityCommand({
            QueueUrl: QUEUE_URL,
            ReceiptHandle: message.ReceiptHandle,
            VisibilityTimeout: backoffSeconds,
          }),
        );

        return;
      }

      if (error instanceof PermanentProviderError) {
        // operacja definitywnie odrzucona
        // payment -> FAILED
        // DeleteMessage

        console.error(
          `⚠️ Worker: PERMANENT PROVIDER ERROR for ${payment.id}`,
        );

        await pool.query(
          `
            UPDATE payments
            SET status = 'FAILED',
                updated_at = NOW(),
                lease_owner = NULL,
                lease_until = NULL
            WHERE id = $1
          `,
          [payment.id],
        );

        await this.sqs.send(
          new DeleteMessageCommand({
            QueueUrl: QUEUE_URL,
            ReceiptHandle: message.ReceiptHandle,
          }),
        );
        
        console.log(
          `⚠️ Worker: ${payment.id} marked FAILED; message deleted`,
        );

        return;
      }

      if (error instanceof UnknownOutcomeError) {
        // side effect mógł zajść
        // payment -> UNKNOWN
        // NIE robimy blind retry

        console.error(
          `⚠️ Worker: UNKNOWN OUTCOME for ${payment.id}`,
        );
      
        await pool.query(
          `
            UPDATE payments
            SET status = 'UNKNOWN',
                lease_owner = NULL,
                lease_until = NULL,
                updated_at = NOW()
            WHERE id = $1
          `,
          [payment.id],
        );
      
        await this.sqs.send(
          new DeleteMessageCommand({
            QueueUrl: QUEUE_URL,
            ReceiptHandle: message.ReceiptHandle,
          }),
        );
      
        console.log(
          `⚠️ Worker: ${payment.id} marked UNKNOWN; message deleted`,
        );
      
        return;
      }

      // Nieznany exception naszego kodu?
      // Nie udawajmy, że wiemy co się stało.
      throw error;
    }

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
