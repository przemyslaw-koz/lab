variable "name_prefix" {
  type        = string
  description = "Resources name prefix"
}

variable "ami_id" {
  type = string
}

variable "instance_type" {
  type = string
}

variable "instance_profile_name" {
  type = string
}

variable "app_sg_id" {
  type = string
}

variable "root_volume_gb" {
  type = number
}

variable "user_data" {
  type = string
}

variable "subnets" {
  type = list(string)
}

variable "target_group_arns" {
  type = list(string)
}

variable "lt_version" {
  type    = string
  default = "$Latest"
}

variable "user_data_hash" {
  type        = string
  default     = ""
  description = "Rendered user_data hash - used to trigger terraform when changed"
}
