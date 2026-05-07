resource "aws_lb" "alb" {
  name                       = "${var.name_prefix}-alb"
  internal                   = true
  load_balancer_type         = "application"
  security_groups            = [var.alb_sg_id]
  subnets                    = var.subnets
  enable_deletion_protection = var.delete_protection
}

resource "aws_lb_target_group" "tg" {
  name        = "${var.name_prefix}-tg"
  port        = var.target_port
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "instance"
  health_check {
    path                = var.health_check_path
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 5
    matcher             = "200-399"
  }
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.alb.arn
  port              = 80
  protocol          = "HTTP"
  dynamic "default_action" {
    for_each = length(var.acm_certificate_arn) > 0 ? [1] : []
    content {
      type = "redirect"
      redirect {
        port        = "443"
        protocol    = "HTTPS"
        status_code = "HTTP_301"
      }
    }
  }
  dynamic "default_action" {
    for_each = length(var.acm_certificate_arn) == 0 ? [1] : []
    content {
      type = "redirect"
      redirect {
        protocol    = "HTTP"
        port        = "9000"
        status_code = "HTTP_301"
        host  = "#{host}"
        path  = "/#{path}"
        query = "#{query}"
      }
    }
  }
}

resource "aws_lb_listener" "http_9000" {
  load_balancer_arn = aws_lb.alb.arn
  port              = 9000
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.tg.arn
  }
}

resource "aws_lb_listener" "https" {
  count             = length(var.acm_certificate_arn) > 0 ? 1 : 0
  load_balancer_arn = aws_lb.alb.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2016-08"
  certificate_arn   = var.acm_certificate_arn
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.tg.arn
  }
}
