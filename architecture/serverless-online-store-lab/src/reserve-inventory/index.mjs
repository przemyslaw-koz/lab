import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  TransactWriteCommand,
} from "@aws-sdk/lib-dynamodb";

const ERROR_OUT_OF_STOCK = "OutOfStockError";

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
        UpdateExpression: "SET stock = stock - :qty",
        ConditionExpression: "stock >= :qty",
        ExpressionAttributeValues: {
          ":qty": item.quantity,
        },
      },
    });
  }

  try {
    await ddbDocClient.send(
      new TransactWriteCommand({
        TransactItems,
      }),
    );
  } catch (error) {
    if (
      error.name === "TransactionCanceledException" &&
      error.CancellationReasons?.some(
        (reason) => reason.Code === "ConditionalCheckFailed",
      )
    ) {
      const outOfStockError = new Error(
        "One or more products are out of stock",
      );
      outOfStockError.name = ERROR_OUT_OF_STOCK;
      throw outOfStockError;
    }
    throw error;
  }

  return event;
};
