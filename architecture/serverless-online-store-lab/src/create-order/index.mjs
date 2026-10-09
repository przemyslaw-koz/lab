import { DynamoDBClient } from "@aws-sdk/client-dynamodb"; // ES6 import
import {
  DynamoDBDocumentClient,
  TransactWriteCommand,
  GetCommand,
} from "@aws-sdk/lib-dynamodb"; // ES6 import
import { randomUUID, createHash } from "node:crypto";

const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);
const ordersTableName = process.env.ORDERS_TABLE;
const idempotencyKeyTableName = process.env.IDEMPOTENCY_KEY_TABLE;

const parseEvent = (event) => {
  const { body } = event;
  return JSON.parse(body);
};

const getIdempotencyKey = (event) => {
  const { headers } = event;
  const idempotencyKey = headers["x-idempotency-key"];
  return idempotencyKey;
};

export const handler = async (event) => {
  const data = parseEvent(event);
  const orderId = randomUUID();
  const now = new Date();

  const createdAt = now.toISOString();
  const expiresAt = Math.floor(now.getTime() / 1000) + 5 * 60;
  const idempotencyKey = getIdempotencyKey(event);

  if (!idempotencyKey) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "Missing x-idempotency-key header",
      }),
    };
  }

  const requestHash = createHash("sha256")
    .update(JSON.stringify(data))
    .digest("hex");

  const idempotencyKeyRecord = {
    idempotencyKey,
    orderId,
    requestHash,
    createdAt,
    expiresAt,
  };

  const order = {
    orderId,
    userId: data.userId,
    status: "NEW",
    items: data.items,
    createdAt,
    updatedAt: createdAt,
  };

  try {
    await ddbDocClient.send(
      new TransactWriteCommand({
        TransactItems: [
          {
            Put: {
              TableName: idempotencyKeyTableName,
              Item: idempotencyKeyRecord,
              ConditionExpression: "attribute_not_exists(idempotencyKey)",
            },
          },
          {
            Put: {
              TableName: ordersTableName,
              Item: order,
            },
          },
        ],
      })
    );
  } catch (error) {
    const isIdempotencyConflict =
      error.name === "TransactionCanceledException" &&
      error.CancellationReasons?.[0]?.Code === "ConditionalCheckFailed";
  
    if (!isIdempotencyConflict) {
      throw error;
    }
  
    const result = await ddbDocClient.send(
      new GetCommand({
        TableName: idempotencyKeyTableName,
        Key: { idempotencyKey },
        ConsistentRead: true,
      })
    );
  
    const existingRecord = result.Item;
  
    if (!existingRecord) {
      throw new Error(
        `Idempotency record not found for key: ${idempotencyKey}`
      );
    }
  
    if (existingRecord.requestHash !== requestHash) {
      return {
        statusCode: 409,
        body: JSON.stringify({
          message: "Idempotency key already used with different request body",
        }),
      };
    }
  
    return {
      statusCode: 202,
      body: JSON.stringify({
        orderId: existingRecord.orderId,
        status: "NEW",
      }),
    };
  }

  return {
    statusCode: 202,
    body: JSON.stringify({ orderId, status: "NEW" }),
  };
};
