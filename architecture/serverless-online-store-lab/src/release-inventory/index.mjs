import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  TransactWriteCommand,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
  const items = event.items;

  const TransactItems = [];

  for (const item of items) {
    TransactItems.push({
      Update: {
        TableName: process.env.INVENTORY_TABLE,
        Key: {
          productId: item.productId,
        },
        UpdateExpression: "SET stock = stock + :qty",
        ExpressionAttributeValues: {
          ":qty": item.quantity,
        },
      },
    });
  }

  TransactItems.push({
    Update: {
      TableName: process.env.ORDERS_TABLE,
      Key: {
        orderId: event.orderId,
      },

      UpdateExpression: "SET #status = :newStatus, #reason = :reason",

      ConditionExpression: "#status = :expectedStatus",

      ExpressionAttributeNames: {
        "#status": "status",
        "#reason": "reason",
      },

      ExpressionAttributeValues: {
        ":newStatus": "REJECTED",
        ":reason": "PAYMENT_DECLINED",
        ":expectedStatus": "INVENTORY_RESERVED",
      },
    },
  });

  try {
    await ddbDocClient.send(
      new TransactWriteCommand({
        TransactItems,
      }),
    );
  } catch (error) {
    console.error(error);
    throw error;
  }

  return event;
};
