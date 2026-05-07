output "db_password_param" {
  description = "DB pass SSM param - name and arn"
  value = {
    name     = aws_ssm_parameter.db_password.name
    arn      = aws_ssm_parameter.db_password.arn
    password = aws_ssm_parameter.db_password.value
  }
}
