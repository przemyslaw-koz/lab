data "archive_file" "create_order_lambda_code" {
  type        = "zip"
  output_path = "${path.module}/build/create-order.zip"
  source_dir  = "${path.module}/../src/create-order"
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
