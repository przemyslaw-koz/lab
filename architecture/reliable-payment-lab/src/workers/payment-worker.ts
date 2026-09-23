import {
  SQSClient,
  ReceiveMessageCommand,
  DeleteMessageCommand,
  ChangeMessageVisibilityCommand,
  type Message,
} from "@aws-sdk/client-sqs";
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

type ReceivedMessage = Message & {
  Body: string;
  ReceiptHandle: string;
};

export class PaymentWorker {
  constructor(
    private readonly sqs: SQSClient,
    private readonly provider: PaymentProvider,
  ) {}

  async receiveMessage(): Promise<ReceivedMessage | undefined> {
    console.log(`📥 Worker: RECEIVING message`);
    const { Messages } = await this.sqs.send(
      new ReceiveMessageCommand({
        MessageSystemAttributeNames: [
          "SentTimestamp",
          "ApproximateReceiveCount",
        ],
        MaxNumberOfMessages: 1,
        MessageAttributeNames: ["All"],
        QueueUrl: QUEUE_URL,
        WaitTimeSeconds: 20,
      }),
    );

    const message = Messages?.[0];
    if (!message?.ReceiptHandle || !message.Body) {
      console.log(`🔢 Worker: NO VISIBLE MESSAGE FOUND`);
      return;
    }

    return message as ReceivedMessage;
  }

  private calculateBackoffSeconds(receiveCount: number): number {
    const baseDelaySeconds = 30;
    const maxDelaySeconds = 600;

    return Math.min(
      baseDelaySeconds * 2 ** (receiveCount - 1),
      maxDelaySeconds,
    );
  }

  async processMessage(message: ReceivedMessage): Promise<void> {
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
        lease_until = NOW() + INTERVAL '5 seconds'
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

    // console.log(`🥶 Worker: FREEZING before provider call...`);
    // await new Promise((resolve) => setTimeout(resolve, 10000));

    const ownership = await pool.query(
      `
        SELECT id
        FROM payments
        WHERE id = $1
          AND status = 'PROCESSING'
          AND lease_owner = $2
          AND lease_until > NOW()
      `,
      [payment.id, WORKER_ID],
    );

    if (ownership.rowCount === 0) {
      console.warn(
        `⚠️ Worker: LOST OWNERSHIP of ${payment.id}; skipping provider call`,
      );
      return;
    }

    console.log(`🔐 Worker: ownership confirmed for ${payment.id}`);
    console.log(`💰 Worker: CAPTURING ${payment.id} via provider`);
    this.maybeCrash("before provider call");

    const heartbeat = setInterval(async () => {
      console.log("❤️ renewing lease");

      const result = await pool.query(
        `
          UPDATE payments
          SET lease_until = NOW() + INTERVAL '5 seconds'
          WHERE id = $1
            AND status = 'PROCESSING'
            AND lease_owner = $2
            AND lease_until > NOW()
          RETURNING lease_until
        `,
        [payment.id, WORKER_ID],
      );

      if (result.rowCount === 0) {
        console.warn(
          `💔 Worker: heartbeat failed; ownership lost for ${payment.id}`,
        );
        return;
      }

      console.log(
        `❤️ Worker: lease renewed until ${result.rows[0].lease_until}`,
      );
    }, 2000);

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

        const updateResult = await pool.query(
          `
            UPDATE payments
            SET status = 'FAILED',
                updated_at = NOW(),
                lease_owner = NULL,
                lease_until = NULL
            WHERE id = $1
            AND lease_owner = $2
            AND status = 'PROCESSING'
          `,
          [payment.id, WORKER_ID],
        );

        if (updateResult.rowCount === 0) {
          console.warn(
            `💔 Worker: failed to update status for ${payment.id}; ownership lost`,
          );
          return;
        }

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

        const updateResult = await pool.query(
          `
            UPDATE payments
            SET status = 'UNKNOWN',
                lease_owner = NULL,
                lease_until = NULL,
                updated_at = NOW()
            WHERE id = $1
            AND lease_owner = $2
            AND status = 'PROCESSING'
          `,
          [payment.id, WORKER_ID],
        );

        if (updateResult.rowCount === 0) {
          console.warn(
            `💔 Worker: failed to update status for ${payment.id}; ownership lost`,
          );
          return;
        }

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
    } finally {
      clearInterval(heartbeat);
    }

    this.maybeCrash("before DB update");

    console.log(`💾 Worker: UPDATING ${payment.id} in DB`);
    const updateResult = await pool.query(
      `
        UPDATE payments
        SET status = 'CAPTURED',
            updated_at = NOW(),
            lease_owner = NULL,
            lease_until = NULL
        WHERE id = $1
            AND lease_owner = $2
            AND status = 'PROCESSING'
      `,
      [payment.id, WORKER_ID],
    );

    if (updateResult.rowCount === 0){
      console.warn(
        `💔 Worker: failed to update status for ${payment.id}; ownership lost`,
      );
      return;
    }

    // console.error(`💥 CRASH after DB update for ${payment.id}`);
    // process.exit(1);

    this.maybeCrash("after DB update");

    console.log(`🗑️ Worker: DELETING message ${payment.id}`);
    await this.sqs.send(
      new DeleteMessageCommand({
        QueueUrl: QUEUE_URL,
        ReceiptHandle: message.ReceiptHandle,
      }),
    );
  }

  private maybeCrash(point: string, probability = 0.01) {
    if (Math.random() < probability) {
      console.error(`💥 CHAOS CRASH at ${point}`);
      process.exit(1);
    }
  }

  async runWorker(): Promise<void> {
    console.log(`👷 Worker started: ${WORKER_ID}`);

    while (true) {
      try {
        const message = await this.receiveMessage();

        if (!message) {
          continue;
        }

        this.maybeCrash("before processMessage");

        try {
          await this.processMessage(message);
        } catch (error) {
          console.error("💥 Processing failed:", error);

          // NIE delete'ujemy message
          // visibility timeout zrobi retry
        }
      } catch (error) {
        console.error("💥 Receive failed:", error);

        // mały delay, żeby np. przy awarii AWS
        // nie zrobić tight error loop
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }
}

const worker = new PaymentWorker(
  new SQSClient({
    region: "eu-north-1",
  }),
  new FakePaymentProvider(),
);

await worker.runWorker();
