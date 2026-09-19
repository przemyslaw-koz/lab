import { SQSClient } from "@aws-sdk/client-sqs";
import { SqsQueue } from "../queue/sqs-queue.js";
import { pool } from "../db/pool.js";

const queue = new SqsQueue(new SQSClient({region: "eu-north-1"}), "https://sqs.eu-north-1.amazonaws.com/567764214274/reliable-payment-requests");

const publish = async () => {
  console.log(`📥 Publisher: SELECTING unpublished events`);

  const client = await pool.connect();

  try {
    const result = await client.query(
      `
      SELECT *
      FROM outbox_events
      WHERE published_at IS NULL
      ORDER BY created_at ASC
      LIMIT 10
      `,
    );

    for (const row of result.rows) {
      try {
        console.log(`📨 Publisher: SELECTED ${row.id}`);
        console.log(`📤 Publisher: SENDING ${row.id} to queue`);
        await queue.send(row);
        // broker confirmed acceptance

        console.log("💥 CRASH after successful send, before DB update");
        process.exit(1);

        console.log(`💾 Publisher: UPDATING ${row.id} in DB`);
        await client.query(
          `
          UPDATE outbox_events
          SET published_at = NOW()
          WHERE id = $1
          `,
          [row.id],
        );
      } catch (error) {
        // publish failed / outcome potentially unknown
        console.error(`❌ Publisher: FAILED ${row.id}`, error);
      }
    }
  } finally {
    client.release();
  }
};

publish();
