terraform {
    backend "s3" {
        bucket = "terraform-state-resonate-shared-services"
        key = "states/sonarqube/terraform.tfstate"
        region = "eu-west-2"
        dynamodb_table = "terraform-state-resonate-shared-services"
        role_arn = "arn:aws:iam::592576041302:role/terraform-manage-state-assumable-role"
        encrypt = true
    }
}