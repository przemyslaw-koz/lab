output "api_endpoint" {
  description = "serverless store api gateway endpoint"
  value       = aws_apigatewayv2_api.serverless_store.api_endpoint
}
