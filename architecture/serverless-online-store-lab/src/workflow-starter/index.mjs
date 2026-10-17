import { SFNClient, StartExecutionCommand } from "@aws-sdk/client-sfn";
import { unmarshall } from "@aws-sdk/util-dynamodb";

const config = {};
const client = new SFNClient(config);

export const handler = async (event) => {
  console.log(JSON.stringify(event, null, 2));
  const batchItemFailures = [];
  const records = event.Records;

  for (const record of records) {
    if (record.eventName === "INSERT") {
      const dynamodbRecord = unmarshall(record.dynamodb.NewImage);
      const input = {
        stateMachineArn: process.env.STATE_MACHINE_ARN,
        name: dynamodbRecord.orderId,
        input: JSON.stringify(dynamodbRecord),
      };

      const command = new StartExecutionCommand(input);
      try {
        if (dynamodbRecord.orderId.startsWith("POISON-ORDER")) {
          throw new Error("Simulated poison record");
        }

        await client.send(command);
      } catch (error) {
        if (error.name === "ExecutionAlreadyExists") {
          console.log(
            `Workflow already exists for order ${dynamodbRecord.orderId}, skipping duplicate`,
          );
          continue;
        }
        console.error(
          `Error thrown for order ${dynamodbRecord.orderId}, adding to batchItemFailures`,
          error.message,
        );

        batchItemFailures.push({
          itemIdentifier: record.dynamodb.SequenceNumber,
        });
      }
    }
  }

  return {
    batchItemFailures,
  };
};
