resource "aws_apigatewayv2_api" "serverless_store" {
  name          = "serverless_store_api"
  protocol_type = "HTTP"
}

resource "aws_apigatewayv2_integration" "create_order" {
  api_id           = aws_apigatewayv2_api.serverless_store.id
  integration_type = "AWS_PROXY"

  description            = "Create Order Lambda"
  integration_method     = "POST"
  integration_uri        = aws_lambda_function.create_order.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "create_order" {
  api_id    = aws_apigatewayv2_api.serverless_store.id
  route_key = "POST /orders"

  target = "integrations/${aws_apigatewayv2_integration.create_order.id}"
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.serverless_store.id
  name        = "$default"
  auto_deploy = true
}

