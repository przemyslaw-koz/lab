resource "aws_sfn_state_machine" "order_processing" {
  name="order_processing"
  role_arn=""
definition = templatefile("${path.module}/definitions/order-processing.asl.json")
}
