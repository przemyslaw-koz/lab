output "alb_sg_id" {
  value       = aws_security_group.alb_sg.id
  description = "SG Id for ALB"
}

output "app_sg_id" {
  value       = aws_security_group.app_sg.id
  description = "SG Id for app"
}

output "rds_sg_id" {
  value       = aws_security_group.rds_sg.id
  description = "SG Id for RDS"
}
