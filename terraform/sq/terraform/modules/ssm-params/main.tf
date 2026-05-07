 resource "random_password" "pg_pass" {
   length  = var.db_pass_length
   special = true
   override_special = "!#$%&()*+,-.:;<=>?[]^_{|}~"
 }

resource "aws_ssm_parameter" "db_password" {
  name  = "/${var.name_prefix}/db/password"
  type  = "SecureString"
  value = random_password.pg_pass.result
}
