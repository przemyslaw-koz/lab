data "archive_file" "create_order_lambda_code" {
  type        = "zip"
  output_path = "${path.module}/build/create-order.zip"
  source_dir  = "${path.module}/../src/create-order"
}

data "archive_file" "workflow_starter_lambda_code" {
  type        = "zip"
  output_path = "${path.module}/build/workflow-starter.zip"
  source_dir  = "${path.module}/../src/workflow-starter"
}

data "archive_file" "reserve_inventory_lambda_code" {
  type        = "zip"
  output_path = "${path.module}/build/reserve-inventory.zip"
  source_dir  = "${path.module}/../src/reserve-inventory"
}

resource "aws_lambda_function" "create_order" {
  filename         = data.archive_file.create_order_lambda_code.output_path
  function_name    = "create-order-lambda"
  role             = aws_iam_role.create_order_lambda_role.arn
  handler          = "index.handler"
  source_code_hash = data.archive_file.create_order_lambda_code.output_base64sha256

  runtime = "nodejs24.x"

  environment {
    variables = {
      ENVIRONMENT           = "lab"
      ORDERS_TABLE          = aws_dynamodb_table.orders_table.name
      IDEMPOTENCY_KEY_TABLE = aws_dynamodb_table.order_idempotency.name
    }
  }
}

resource "aws_lambda_function" "workflow_starter" {
  filename         = data.archive_file.workflow_starter_lambda_code.output_path
  function_name    = "workflow-starter-lambda"
  role             = aws_iam_role.workflow_starter_lambda_role.arn
  handler          = "index.handler"
  source_code_hash = data.archive_file.workflow_starter_lambda_code.output_base64sha256

  runtime = "nodejs24.x"

  environment {
    variables = {
      ENVIRONMENT       = "lab"
      STATE_MACHINE_ARN = aws_sfn_state_machine.order_processing.arn
    }
  }
}

resource "aws_lambda_function" "reserve_inventory" {
  filename         = data.archive_file.reserve_inventory_lambda_code.output_path
  function_name    = "reserve-inventory-lambda"
  role             = aws_iam_role.reserve_inventory_lambda_role.arn
  handler          = "index.handler"
  source_code_hash = data.archive_file.reserve_inventory_lambda_code.output_base64sha256
  runtime          = "nodejs24.x"

  environment {
    variables = {
      ENVIRONMENT     = "lab"
      INVENTORY_TABLE = aws_dynamodb_table.inventory_table.name
    }
  }
}

resource "aws_lambda_event_source_mapping" "orders_stream_to_workflow_starter" {
  event_source_arn        = aws_dynamodb_table.orders_table.stream_arn
  function_name           = aws_lambda_function.workflow_starter.arn
  starting_position       = "LATEST"
  function_response_types = ["ReportBatchItemFailures"]
  maximum_retry_attempts  = 3
  destination_config {
    on_failure {
      destination_arn = aws_sqs_queue.order_processing_dlq.arn
    }
  }
}
