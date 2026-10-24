# -----------------------------------------------------------------------------
# Common for Lambda functions
# Trust policy and basic permissions to CloudWatch logs
# -----------------------------------------------------------------------------

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

data "aws_iam_policy" "AWSLambdaBasicExecutionRole" {
  arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# -----------------------------------------------------------------------------
# Lambda create-order
# Role used to write to DynamoDB and allow API Gateway invocation
# -----------------------------------------------------------------------------

data "aws_iam_policy_document" "create_order_permissions" {
  statement {
    effect = "Allow"

    actions = [
      "dynamodb:PutItem",
      "dynamodb:GetItem",
      "dynamodb:TransactWriteItems"
    ]

    resources = [
      aws_dynamodb_table.orders_table.arn,
      aws_dynamodb_table.order_idempotency.arn
    ]
  }
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

# -----------------------------------------------------------------------------
# Lambda workflow-starter
# Role used to read DynamoDB stream and start Step Functions execution
# -----------------------------------------------------------------------------

data "aws_iam_policy_document" "workflow_starter_permissions" {
  statement {
    effect = "Allow"

    actions = [
      "dynamodb:DescribeStream",
      "dynamodb:GetRecords",
      "dynamodb:GetShardIterator",
    ]

    resources = [
      aws_dynamodb_table.orders_table.stream_arn
    ]
  }

  statement {
    effect = "Allow"

    actions = [
      "dynamodb:ListStreams",
    ]

    resources = ["*"]
  }

  statement {
    effect = "Allow"

    actions = [
      "states:StartExecution"
    ]

    resources = [
      aws_sfn_state_machine.order_processing.arn
    ]
  }

  statement {
    effect = "Allow"

    actions = [
      "sqs:SendMessage"
    ]

    resources = [
      aws_sqs_queue.order_processing_dlq.arn
    ]
  }
}

resource "aws_iam_role" "workflow_starter_lambda_role" {
  name               = "workflow_starter_lambda_role"
  assume_role_policy = data.aws_iam_policy_document.assume_role.json
}

resource "aws_iam_role_policy" "workflow_starter_permissions" {
  name   = "workflow_starter_permissions"
  role   = aws_iam_role.workflow_starter_lambda_role.id
  policy = data.aws_iam_policy_document.workflow_starter_permissions.json
}

resource "aws_iam_role_policy_attachment" "workflow_starter_lambda_basic_execution" {
  role       = aws_iam_role.workflow_starter_lambda_role.name
  policy_arn = data.aws_iam_policy.AWSLambdaBasicExecutionRole.arn
}

# -----------------------------------------------------------------------------
# Lambda reserve_inventory
# Role used by lambda to reserve inventory in dynamodb table
# -----------------------------------------------------------------------------

data "aws_iam_policy_document" "reserve_inventory_permissions" {
  statement {
    effect = "Allow"

    actions = [
      "dynamodb:TransactWriteItems",
      "dynamodb:UpdateItem"
    ]

    resources = [aws_dynamodb_table.inventory_table.arn]
  }
}

resource "aws_iam_role" "reserve_inventory_lambda_role" {
  name               = "reserve_inventory_lambda_role"
  assume_role_policy = data.aws_iam_policy_document.assume_role.json
}

resource "aws_iam_role_policy" "reserve_inventory_permissions" {
  name   = "reserve_inventory_permissions"
  role   = aws_iam_role.reserve_inventory_lambda_role.id
  policy = data.aws_iam_policy_document.reserve_inventory_permissions.json
}

resource "aws_iam_role_policy_attachment" "reserve_inventory_lambda_basic_execution" {
  role       = aws_iam_role.reserve_inventory_lambda_role.name
  policy_arn = data.aws_iam_policy.AWSLambdaBasicExecutionRole.arn
}

# -----------------------------------------------------------------------------
# Lambda fake_payment_provider
# Role used by lambda to simulate external payment oprovide
# -----------------------------------------------------------------------------

resource "aws_iam_role" "fake_payment_provider_lambda_role" {
  name               = "fake_payment_provider_lambda_role"
  assume_role_policy = data.aws_iam_policy_document.assume_role.json
}

resource "aws_iam_role_policy_attachment" "fake_payment_provider_lambda_basic_execution" {
  role       = aws_iam_role.fake_payment_provider_lambda_role.name
  policy_arn = data.aws_iam_policy.AWSLambdaBasicExecutionRole.arn
}

# -----------------------------------------------------------------------------
# Lambda release_inventory
# Role used by lambda to release inventory in dynamodb table
# -----------------------------------------------------------------------------

data "aws_iam_policy_document" "release_inventory_permissions" {
  statement {
    effect = "Allow"

    actions = [
      "dynamodb:TransactWriteItems",
      "dynamodb:UpdateItem"
    ]

    resources = [
      aws_dynamodb_table.inventory_table.arn,
      aws_dynamodb_table.orders_table.arn
    ]
  }
}

resource "aws_iam_role" "release_inventory_lambda_role" {
  name               = "release_inventory_lambda_role"
  assume_role_policy = data.aws_iam_policy_document.assume_role.json
}

resource "aws_iam_role_policy" "release_inventory_permissions" {
  name   = "release_inventory_permissions"
  role   = aws_iam_role.release_inventory_lambda_role.id
  policy = data.aws_iam_policy_document.release_inventory_permissions.json
}

resource "aws_iam_role_policy_attachment" "release_inventory_lambda_basic_execution" {
  role       = aws_iam_role.release_inventory_lambda_role.name
  policy_arn = data.aws_iam_policy.AWSLambdaBasicExecutionRole.arn
}

# -----------------------------------------------------------------------------
# Step Functions order-processing
# Role used by state machine
# -----------------------------------------------------------------------------

data "aws_iam_policy_document" "sfn_assume_role" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["states.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_role" "order_processing_sfn_role" {
  name               = "order_processing_sfn_role"
  assume_role_policy = data.aws_iam_policy_document.sfn_assume_role.json
}

data "aws_iam_policy_document" "order_processing_sfn_permissions" {
  statement {
    effect = "Allow"

    actions = [
      "lambda:InvokeFunction"
    ]

    resources = [
      aws_lambda_function.reserve_inventory.arn,
      aws_lambda_function.fake_payment_provider.arn,
      aws_lambda_function.release_inventory.arn
    ]
  }

  statement {
    effect = "Allow"

    actions = [
      "dynamodb:UpdateItem"
    ]

    resources = [
      aws_dynamodb_table.orders_table.arn
    ]
  }

  statement {
    effect = "Allow"

    actions = [
      "dynamodb:PutItem"
    ]

    resources = [
      aws_dynamodb_table.payments_table.arn
    ]
  }
}

resource "aws_iam_role_policy" "order_processing_sfn_permissions" {
  name   = "order_processing_sfn_permissions"
  role   = aws_iam_role.order_processing_sfn_role.id
  policy = data.aws_iam_policy_document.order_processing_sfn_permissions.json
}
