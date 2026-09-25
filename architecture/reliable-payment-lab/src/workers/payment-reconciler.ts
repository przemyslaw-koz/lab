import { randomUUID } from "node:crypto";
import { Pool } from "pg";
import { FakePaymentProvider } from "../provider/fake-payment-provider.js";

const paymentProvider = new FakePaymentProvider();

const run = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required");
  }

  console.log("🚀 Payment reconciler: STARTED");

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  while (true) {
    let client;

    try {
      client = await pool.connect();

      const result = await client.query(`
        SELECT *
        FROM payments
        WHERE status = 'PROCESSING'
          AND lease_until < NOW() - INTERVAL '30 seconds'
      `);

      console.log("🔄 Payment reconciler: RESULT", result.rows);
      for (const payment of result.rows) {
        try {
          const status = await paymentProvider.getStatus(payment);
          if (status === "CAPTURED") {
            await client.query(`UPDATE payments
            SET status = 'CAPTURED',
            lease_owner = NULL,
            lease_until = NULL,
            updated_at = NOW()
          WHERE id = $1
          AND lease_owner = $2
          AND status = 'PROCESSING'
          AND lease_until < NOW() - INTERVAL '30 seconds'
          RETURNING id;`, [payment.id, payment.lease_owner]);
          } else if (status === "NOT_FOUND") {
            await client.query("BEGIN");

            try {
              const updated = await client.query(
                `
              UPDATE payments
              SET status = 'PENDING',
                lease_owner = NULL,
                lease_until = NULL,
                updated_at = NOW()
              WHERE id = $1
              AND lease_owner = $2
              AND status = 'PROCESSING'
              AND lease_until < NOW() - INTERVAL '30 seconds'
              RETURNING id;`,
                [payment.id, payment.lease_owner]
              );

              if (updated.rowCount === 1) {
                await client.query(
                  `
                INSERT INTO outbox_events
                (id, payment_id, event_type, payload)
              VALUES ($1, $2, $3, $4);`,
                  [
                    randomUUID(),
                    payment.id,
                    "PAYMENT_REQUESTED",
                    JSON.stringify({ payment_id: payment.id }),
                  ]
                );
              }

              await client.query("COMMIT");
            } catch (error) {
              await client.query("ROLLBACK");
              throw error;
            }
          } else {
            console.warn(`⚠️ Cannot reconcile ${payment.id} yet`);
          }
        } catch (error) {
          console.error(
            `❌ Reconciliation failed for ${payment.id}`,
            error
          );
        }
      }
    } catch (error) {
      console.error("❌ Payment reconciler: ERROR", error);
    } finally {
      client?.release();
    }

    await new Promise((resolve) => setTimeout(resolve, 10_000));
  }
};

run();
