resource "aws_cloudwatch_metric_alarm" "order_processing_dlq_alarm" {
  alarm_name  = "order_processing_dlq_alarm"
  namespace   = "AWS/SQS"
  metric_name = "ApproximateNumberOfMessagesVisible"
  dimensions = {
    QueueName = aws_sqs_queue.order_processing_dlq.name
  }

  statistic           = "Maximum"
  period              = 60
  evaluation_periods  = 1
  comparison_operator = "GreaterThanOrEqualToThreshold"
  threshold           = 1

  alarm_description = "At least one failed order processing event is present in the DLQ"
}
