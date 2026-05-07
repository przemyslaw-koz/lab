variable "name_prefix" {
  type        = string
  description = "Resources name prefix"
}

variable "vpc_id" {
  type        = string
  description = "VPC ID"
}

variable "subnets" {
  type        = list(string)
  description = "Public subnets for ALB"
}

variable "alb_sg_id" {
  type        = string
  description = "ALB's security group ID"
}

variable "target_port" {
  type        = number
  default     = 9000
  description = "Backend port"
}

variable "acm_certificate_arn" {
  type        = string
  default     = ""
  description = "Optional ACM cert for HTTPS"
}

variable "health_check_path" {
  type        = string
  default     = "/"
  description = "Health check path"
}

variable "delete_protection" {
  type        = bool
  default     = true
  description = "Delete protect the ALB"
}
