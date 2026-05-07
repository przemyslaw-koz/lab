module "ssm_params" {
  source         = "../modules/ssm-params"
  name_prefix    = var.name
  db_pass_length = 25
}

module "iam_ec2" {
  source            = "../modules/iam-ec2"
  name_prefix       = var.name
  ssm_parameter_arn = module.ssm_params.db_password_param.arn
}

module "sg" {
  source                    = "../modules/security-groups"
  name_prefix               = var.name
  vpc_id                    = var.vpc_id
  allowed_ui_cidrs          = var.allowed_ui_cidrs
  allowed_ui_source_sg_ids  = var.allowed_ui_source_sg_ids
  remote_agent_http_cidrs   = var.remote_agent_http_cidrs
  remote_agent_subnet_cidrs = var.remote_agent_subnet_cidrs
}

resource "aws_vpc_security_group_ingress_rule" "vpce_https_from_app" {
  security_group_id            = var.endpoint_sg_id
  ip_protocol                  = "tcp"
  from_port                    = 443
  to_port                      = 443
  referenced_security_group_id = module.sg.app_sg_id
  description                  = "SSM endpoints: allow 443 from ${var.name} app SG"
}

resource "aws_vpc_security_group_ingress_rule" "ecr_vpce_https_from_app" {
  security_group_id            = var.ecr_endpoint_sg_id
  ip_protocol                  = "tcp"
  from_port                    = 443
  to_port                      = 443
  referenced_security_group_id = module.sg.app_sg_id
  description                  = "ECR endpoints: allow 443 from ${var.name} app SG"
}

module "alb" {
  source            = "../modules/alb"
  name_prefix       = var.name
  vpc_id            = var.vpc_id
  subnets           = var.public_subnets
  alb_sg_id         = module.sg.alb_sg_id
  target_port       = 9000
  delete_protection = var.is_prod
}

module "rds" {
  source          = "../modules/rds-postgres"
  name_prefix     = var.name
  private_subnets = var.private_subnets
  rds_sg_id       = module.sg.rds_sg_id
  db_pass         = module.ssm_params.db_password_param.password
  db              = var.db
}

data "aws_ami" "image_by_name" {
  most_recent = true
  owners      = var.ami_filters.owners

  filter {
    name   = "name"
    values = [var.ami_filters.name]
  }

  filter {
    name   = "architecture"
    values = [var.ami_filters.architecture]
  }

  filter {
    name   = "root-device-type"
    values = [var.ami_filters.root_device_type]
  }

  filter {
    name   = "virtualization-type"
    values = [var.ami_filters.virtualization_type]
  }
}

locals {
  userdata = templatefile("${path.module}/files/userdata-sonar.sh.tmpl", {
    region       = var.region
    db_host      = module.rds.address
    db_name      = var.db.name
    db_user      = var.db.username
    ssm_pass_key = module.ssm_params.db_password_param.name
    ecr_image    = var.ecr_image
    log_path     = var.userdata_log_path
  })
  userdata_hash = sha256(local.userdata)
}

module "lt_asg" {
  source                = "../modules/lt-asg"
  name_prefix           = var.name
  ami_id                = data.aws_ami.image_by_name.id
  instance_type         = var.instance_type
  instance_profile_name = module.iam_ec2.instance_profile_name
  app_sg_id             = module.sg.app_sg_id
  root_volume_gb        = var.root_volume_gb
  user_data_hash        = local.userdata_hash
  user_data             = local.userdata
  subnets               = var.public_subnets
  target_group_arns     = [module.alb.target_group_arn]
}
