resource "aws_sqs_queue" "order_processing_dlq" {
  name                      = "order_processing_dlq"
  message_retention_seconds = 1209600 # 14 dni

  tags = {
    Environment = "lab"
  }
}
