variable "name_prefix" {
  description = "Resource name prefix"
  type        = string
}

variable "db_pass_length" {
  type        = number
  description = "Length of generated DB password"
  default     = 25
  validation {
    condition = var.db_pass_length >= 16
    error_message = "db_pass_length must be equal or greater 16"
  }
}
