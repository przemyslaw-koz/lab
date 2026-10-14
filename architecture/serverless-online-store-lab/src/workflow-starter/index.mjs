import { SFNClient, StartExecutionCommand } from "@aws-sdk/client-sfn";
import { unmarshall } from "@aws-sdk/util-dynamodb";

const config = {};
const client = new SFNClient(config);

export const handler = async (event) => {
  console.log(JSON.stringify(event, null, 2));
  const records = event.Records;

  for (const record of records) {
    if (record.eventName === "INSERT") {
      const dynamodbRecord = unmarshall(record.dynamodb.NewImage);
      const input = {
        // StartExecutionInput
        stateMachineArn: process.env.STATE_MACHINE_ARN,
        name: dynamodbRecord.orderId,
        input: JSON.stringify(dynamodbRecord),
      };

      const command = new StartExecutionCommand(input);
      try {
        await client.send(command);
      } catch (error) {
        if (error.name === "ExecutionAlreadyExists") {
          console.log(
            `Workflow already exists for order ${dynamodbRecord.orderId}, skipping duplicate`,
          );
          continue;
        }
        throw error;
      }
    }
  }

  return {
    batchItemFailures: [],
  };
};
