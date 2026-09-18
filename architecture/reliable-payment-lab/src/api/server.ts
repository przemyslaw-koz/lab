import Fastify from "fastify";
import { randomUUID } from "node:crypto";
import { pool } from "../db/pool.js";

const fastify = Fastify({
  logger: true,
});

type PaymentBody = {
  amount: number;
  currency: string;
};

fastify.post("/payments", async function (request, reply) {
  const body = request.body as PaymentBody;
  const idempotencyKey = request.headers["idempotency-key"];

  if (typeof idempotencyKey !== "string") {
    return reply.code(400).send({
      error: "Idempotency-Key header is required",
    });
  }

  const paymentId = randomUUID();
  const eventId = randomUUID();

  const client = await pool.connect();
  const response = {
    paymentId: paymentId,
    status: "PENDING",
  };

  try {
    await client.query("BEGIN");

    const insertResult = await client.query(
      `
      INSERT INTO payments (
        id,
        idempotency_key,
        amount,
        currency,
        status
      )
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (idempotency_key) DO NOTHING
      `,
      [
        paymentId,
        idempotencyKey,
        body.amount,
        body.currency,
        "PENDING",
      ],
    );

    if (insertResult.rowCount === 0) {
      const existing = await client.query(
        `SELECT id, status FROM payments WHERE idempotency_key = $1`,
        [idempotencyKey],
      );
      response.paymentId = existing.rows[0].id;
      response.status = existing.rows[0].status;
    } else {
      await client.query(
        `
        INSERT INTO outbox_events (
          id,
          payment_id,
          event_type,
          payload
        )
        VALUES ($1, $2, $3, $4)
        `,
        [
          eventId,
          paymentId,
          "PAYMENT_REQUESTED",
          JSON.stringify({
            paymentId,
            amount: body.amount,
            currency: body.currency,
          }),
        ],
      );
    }

    await client.query("COMMIT");

    return reply.code(202).send({
      ...response,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
});

fastify.listen({ port: 3000 }, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});