// Require the framework and instantiate it

// ESM
import Fastify from 'fastify'
import { pool } from '../db/pool.js'

const fastify = Fastify({
  logger: true
})

// Declare a route
fastify.post('/payments', async function (request, reply) {
  const body = request.body;
  console.log(body)
  const idempotency_key = request.headers['idempotency-key'];
  console.log(idempotency_key)

  const result = await pool.query('SELECT NOW()')
  console.log(result.rows)

  reply.code(202).send({ok: true})
})

// Run the server!
fastify.listen({ port: 3000 }, function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  // Server is now listening on ${address}
})
