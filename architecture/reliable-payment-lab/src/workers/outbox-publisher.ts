import { SQSClient } from "@aws-sdk/client-sqs";
import { SqsQueue } from "../queue/sqs-queue.js";
import { pool } from "../db/pool.js";

const queue = new SqsQueue(new SQSClient({region: "eu-north-1"}), "https://sqs.eu-north-1.amazonaws.com/567764214274/reliable-payment-requests");

const publish = async () => {
  console.log("🚀 Publisher: STARTING");

  while (true) {
    console.log(`📥 Publisher: SELECTING unpublished events`);

    let client;

    try {
      client = await pool.connect();
      const result = await client.query(
        `
      SELECT *
      FROM outbox_events
      WHERE published_at IS NULL
      ORDER BY created_at ASC
      LIMIT 20
      `,
      );

      if (result.rows.length === 0) {
        console.log("📥 Publisher: NO unpublished events found");
        await new Promise(resolve => setTimeout(resolve, 1_000));
      } else {
        for (const row of result.rows) {
          try {
            console.log(`📨 Publisher: SELECTED ${row.id}`);
            console.log(`📤 Publisher: SENDING ${row.id} to queue`);
            await queue.send(row);
            // broker confirmed acceptance

            // console.log("💥 CRASH after successful send, before DB update");
            // process.exit(1);

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
      }
    } catch (error) {
      console.error("❌ Publisher: ERROR", error);
      await new Promise(resolve => setTimeout(resolve, 1_000));
    } finally {
      client?.release();
    }
  }
};

publish();
