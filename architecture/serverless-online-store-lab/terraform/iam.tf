data "aws_iam_policy_document" "assume_role" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

data "aws_iam_policy_document" "create_order_permissions" {
  statement {
    effect = "Allow"

    actions = [
      "dynamodb:PutItem",
      "dynamodb:GetItem"
    ]

    resources = [
      aws_dynamodb_table.orders_table.arn,
      aws_dynamodb_table.order_idempotency.arn
    ]
  }
}

data "aws_iam_policy" "AWSLambdaBasicExecutionRole" {
  arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role" "create_order_lambda_role" {
  name               = "create_order_lambda_role"
  assume_role_policy = data.aws_iam_policy_document.assume_role.json
}

resource "aws_iam_role_policy" "create_order_permissions" {
  name   = "create_order_permissions"
  role   = aws_iam_role.create_order_lambda_role.id
  policy = data.aws_iam_policy_document.create_order_permissions.json
}

resource "aws_iam_role_policy_attachment" "create_order_lambda_basic_execution" {
  role       = aws_iam_role.create_order_lambda_role.name
  policy_arn = data.aws_iam_policy.AWSLambdaBasicExecutionRole.arn
}

resource "aws_lambda_permission" "create_order_invoke_permission" {
  action        = "lambda:InvokeFunction"
  principal     = "apigateway.amazonaws.com"
  function_name = aws_lambda_function.create_order.function_name
  source_arn    = "${aws_apigatewayv2_api.serverless_store.execution_arn}/*/*"
}
