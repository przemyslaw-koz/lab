resource "aws_sfn_state_machine" "order_processing" {
  name       = "order_processing"
  role_arn   = aws_iam_role.order_processing_sfn_role.arn
  definition = templatefile("${path.module}/definitions/order-processing.asl.json", {})
}
