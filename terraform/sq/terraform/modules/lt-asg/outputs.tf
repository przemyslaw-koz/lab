output "lt_id" {
  description = "Launch template ID"
  value       = aws_launch_template.lt.id
}

output "asg_name" {
  description = "Auto Scaling Group Name"
  value       = aws_autoscaling_group.asg.name
}
