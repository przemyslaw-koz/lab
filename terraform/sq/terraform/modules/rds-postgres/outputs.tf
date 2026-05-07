output "address" {
  description = "Endpoint address (hostname) RDS"
  value       = aws_db_instance.rds.address
}

output "port" {
  description = "RDS port"
  value       = aws_db_instance.rds.port
}

output "db_identifier" {
  description = "Instance identifier (Terraform id)"
  value       = aws_db_instance.rds.id
}
