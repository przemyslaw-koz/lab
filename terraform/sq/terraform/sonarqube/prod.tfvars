region  = "eu-west-2"
name    = "sonar-prod"
is_prod = true

vpc_id          = "vpc-da31c9b3"
public_subnets  = ["subnet-29f41852", "subnet-02b326430917ad933"]
private_subnets = ["subnet-0c4c8170368c91854", "subnet-097b0902b32cd0dad"]

allowed_ui_cidrs = [
  "172.16.0.0/12",
  "10.255.0.0/16",
]

allowed_ui_source_sg_ids = [
  "sg-053e7c1bbcbcd0445",
  "sg-028578577d8e1fca9",
]

remote_agent_subnet_cidrs = [
  "10.5.0.0/17"
]

remote_agent_http_cidrs = [
  "10.5.0.0/23"
]

instance_type  = "t3.large"
root_volume_gb = 60
ecr_image      = "592576041302.dkr.ecr.eu-west-2.amazonaws.com/sonarqube/sonarqube-developer:latest"

# RDS
db = {
  name                    = "sonarprod"
  username                = "sonar"
  instance_class          = "db.t3.small"
  allocated_storage       = 20
  engine_version          = "15"
  backup_retention_period = 7
  backup_window           = "03:00-04:00"
}

endpoint_sg_id     = "sg-041a16675ba4d37c9"
ecr_endpoint_sg_id = "sg-05fd21a423ff3734b"

ami_filters = {
  name = "al2023-ami-2023.9.20251014.0-kernel-6.1-x86_64"
}
userdata_log_path = "/var/log/userdata.log"
