output "bucket" { value = aws_s3_bucket.tf_state.id }
output "table" { value = aws_dynamodb_table.tf_lock.name }
