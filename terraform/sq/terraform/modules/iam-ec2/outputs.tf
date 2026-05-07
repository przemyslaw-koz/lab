output "role" {
  description = "EC2 role - name and arn"
  value = {
    name = aws_iam_role.ec2.name
    arn  = aws_iam_role.ec2.arn
  }

}

output "instance_profile_name" {
  description = "EC2 instance profile name"
  value       = aws_iam_instance_profile.ec2.name
}
