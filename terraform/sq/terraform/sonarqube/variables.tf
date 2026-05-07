variable "author" {
  type        = string
  description = "Pipeline author"
  default     = ""
}

variable "region" {
  type = string
}
variable "name" {
  type = string
}
variable "is_prod" {
  type    = bool
  default = false
}
variable "vpc_id" {
  type = string
}
variable "public_subnets" {
  type = list(string)
}
variable "private_subnets" {
  type = list(string)
}
variable "allowed_ui_cidrs" {
  type = list(string)
}

variable "instance_type" {
  type = string
}
variable "root_volume_gb" {
  type = number
}
variable "ecr_image" {
  type = string
}

variable "db" {
  type = object({
    name              = string
    username          = string
    instance_class    = string
    allocated_storage = number
    engine_version    = string
  })
}

variable "ami_filters" {
  description = "AMI search filters."
  type = object({
    name                = string
    architecture        = optional(string, "x86_64")
    root_device_type    = optional(string, "ebs")
    virtualization_type = optional(string, "hvm")
    owners              = optional(list(string), ["amazon"])
  })

  validation {
    condition     = length(trimspace(var.ami_filters.name)) > 0
    error_message = "ami_filters.name cannot be empty."
  }
}
variable "endpoint_sg_id" {
  type        = string
  description = "Existing SG used by SSM VPC Interface Endpoints"
}

variable "remote_agent_http_cidrs" {
  type        = list(string)
  description = "CIDRs for remote agents allowed to ALB on port 80 (e.g. TMV agents)"
  default     = []
}

variable "ecr_endpoint_sg_id" {
  type        = string
  description = "Existing SG attached to VPC ECR Interface Endpoints"
}

variable "remote_agent_subnet_cidrs" {
  type        = list(string)
  description = "Different AWS account agent's CIDRs"
}

variable "allowed_ui_source_sg_ids" {
  description = "Security Groups, that are allowed to connect to ALB on port 9000"
  type        = list(string)
  default     = []
}

variable "userdata_log_path" {
  description = "User data log file path."
  type        = string
  default     = "/var/log/userdata.log"
}
