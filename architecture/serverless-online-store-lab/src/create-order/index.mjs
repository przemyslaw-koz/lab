import { DynamoDBClient } from "@aws-sdk/client-dynamodb"; // ES6 import
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb"; // ES6 import
import { randomUUID } from "node:crypto";

const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);
const tableName = process.env.ORDERS_TABLE;

const parseEvent = (event) => {
  const { body } = event;
  return JSON.parse(body);
};

export const handler = async (event) => {
  const data = parseEvent(event);
  const orderId = randomUUID();
  const now = new Date().toISOString();

  const order = {
    orderId,
    userId: data.userId,
    status: "NEW",
    items: data.items,
    createdAt: now,
    updatedAt: now,
  };

  await ddbDocClient.send(
    new PutCommand({
      TableName: tableName,
      Item: order,
    })
  );

  return {
    statusCode: 202,
    body: JSON.stringify({ orderId, status: "NEW" }),
  };
};
