terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = ">=3.6.0"
    }
  }
}

provider "aws" {
  region = var.region

  assume_role {
    role_arn = "arn:aws:iam::592576041302:role/terraform-provisioning-assumable-role"
  }

  default_tags {
    tags = {
      Project     = var.name
      ManagedBy   = "Terraform"
      Environment = "test"
    }
  }
}
