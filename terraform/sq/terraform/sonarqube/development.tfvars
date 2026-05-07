region = "eu-west-2"
name   = "sonar-test2"

vpc_id          = "vpc-da31c9b3"
public_subnets  = ["subnet-29f41852", "subnet-02b326430917ad933"]
private_subnets = ["subnet-0c4c8170368c91854", "subnet-097b0902b32cd0dad"]

allowed_ui_cidrs = ["83.26.57.48/32"]

acm_certificate_arn = ""

instance_type  = "t3.large"
root_volume_gb = 60
ecr_image      = "592576041302.dkr.ecr.eu-west-2.amazonaws.com/sonarqube/sonarqube-lts-community:latest"

# RDS
db = {
  name              = "sonartest"
  username          = "sonar"
  instance_class    = "db.t3.small"
  allocated_storage = 20
  engine_version    = "15"
}

endpoint_sg_id     = "sg-041a16675ba4d37c9"
ecr_endpoint_sg_id = "sg-05fd21a423ff3734b"
