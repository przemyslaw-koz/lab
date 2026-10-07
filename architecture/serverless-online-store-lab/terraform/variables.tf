variable "aws_region" {
  description = "AWS region used by Terraform"
  type        = string
  default     = "eu-north-1"
}

variable "aws_profile" {
  description = "AWS profile used by Terraform"
  type        = string
  default     = "terraform-lab"
}
