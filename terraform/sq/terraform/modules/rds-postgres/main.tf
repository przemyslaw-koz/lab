resource "aws_db_subnet_group" "rds_subnets" {
  name       = "${var.name_prefix}-rds-subnets"
  subnet_ids = var.private_subnets
}

resource "aws_db_instance" "rds" {
  identifier              = "${var.name_prefix}-db"
  engine                  = "postgres"
  engine_version          = var.db.engine_version
  instance_class          = var.db.instance_class
  username                = var.db.username
  password                = var.db_pass
  db_name                 = var.db.name
  allocated_storage       = var.db.allocated_storage
  storage_type            = "gp3"
  storage_encrypted       = true
  multi_az                = false
  publicly_accessible     = false
  skip_final_snapshot     = false
  backup_retention_period = var.db.backup_retention_period
  apply_immediately       = true
  backup_window           = var.db.backup_window

  tags = {
    Name = "${var.name_prefix}-rds"
  }

  vpc_security_group_ids = [var.rds_sg_id]
  db_subnet_group_name   = aws_db_subnet_group.rds_subnets.name
}
