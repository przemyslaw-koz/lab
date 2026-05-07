variable "name_prefix" {
  type        = string
  description = "IAM resources name prefix"
}

variable "ssm_parameter_arn" {
  type        = string
  description = "SSM param's ARN (with DB password)"
}

variable "allow_kms_key_arns" {
  type        = list(string)
  default     = ["arn:aws:kms:*:*:alias/aws/ssm"]
  description = "List of KMS key ARNs to grant kms:Decrypt"
}
