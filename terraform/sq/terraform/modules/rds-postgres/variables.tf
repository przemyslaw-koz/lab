variable "name_prefix" {
  type        = string
  description = "Resource name prefix"
}

variable "private_subnets" {
  type        = list(string)
  description = "Private subnets"
}

variable "rds_sg_id" {
  type        = string
  description = "Security group ID"
}

variable "db_pass" {
  type        = string
  sensitive   = true
  description = "db password"
}

variable "db" {
  type = object({
    name                    = string
    username                = string
    instance_class          = string
    allocated_storage       = number
    engine_version          = string
    backup_retention_period = number
    backup_window           = string
  })
  description = "Database variables"
}
