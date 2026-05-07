resource "aws_security_group" "alb_sg" {
  name   = "${var.name_prefix}-alb-sg"
  vpc_id = var.vpc_id

  dynamic "ingress" {
    for_each = var.allowed_ui_ports
    content {
      from_port   = ingress.value
      to_port     = ingress.value
      protocol    = "tcp"
      cidr_blocks = var.allowed_ui_cidrs
      description = "UI ingress on port ${ingress.value}"
    }
  }

  ingress {
    protocol    = "tcp"
    from_port   = 80
    to_port     = 80
    cidr_blocks = var.remote_agent_http_cidrs
    description = "Agents from TMV on port 80"
  }

  ingress {
    protocol    = "tcp"
    from_port   = 9000
    to_port     = 9000
    cidr_blocks = var.remote_agent_subnet_cidrs
    description = "Agents form different AWS accounts"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group_rule" "alb_9000_from_sgs" {
  for_each                 = toset(var.allowed_ui_source_sg_ids)
  type                     = "ingress"
  from_port                = 9000
  to_port                  = 9000
  protocol                 = "tcp"
  security_group_id        = aws_security_group.alb_sg.id
  source_security_group_id = each.value
  description              = "Allow SG ${each.value} to ALB:9000"
}

resource "aws_security_group" "app_sg" {
  name   = "${var.name_prefix}-app-sg"
  vpc_id = var.vpc_id
  ingress {
    description     = "From ALB"
    from_port       = 9000
    to_port         = 9000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb_sg.id]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "rds_sg" {
  name   = "${var.name_prefix}-rds-sg"
  vpc_id = var.vpc_id

  ingress {
    description     = "Postgress from app"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.app_sg.id]
  }
}
