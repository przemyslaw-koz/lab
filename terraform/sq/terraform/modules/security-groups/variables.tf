variable "name_prefix" {
  description = "SG name prefix"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

# 80/443
variable "allowed_ui_cidrs" {
  description = "CIDRs allowed to enter via ports 80 and 443"
  type        = list(string)

}

variable "allowed_ui_source_sg_ids" {
  description = "Security Groups, that are allowed to connect to ALB on port 9000"
  type        = list(string)
  default     = []
}

variable "remote_agent_http_cidrs" {
  description = "CIDRs for remote agents allowed to ALB on port 80 (e.g. TMV agents)"
  type        = list(string)
  default     = []
}

variable "remote_agent_subnet_cidrs" {
  description = "Different AWS account agents' CIDRs"
  type        = list(string)
  default     = []
}

variable "allowed_ui_ports" {
  description = "Ports exposed on ALB for UI access"
  type        = list(number)
  default     = [80, 443, 9000]
}
