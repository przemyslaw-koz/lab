import { pool } from "../db/pool.js";

const publish = async () => {
  console.log("Publishing outbox events");
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT * FROM outbox_events WHERE published_at IS NULL ORDER BY created_at ASC LIMIT 10`,
    );
    console.log(result.rows);
  } finally {
    client.release();
  }
};

publish();
