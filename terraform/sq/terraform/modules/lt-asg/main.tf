resource "aws_launch_template" "lt" {
  name_prefix            = "${var.name_prefix}-lt-"
  image_id               = var.ami_id
  instance_type          = var.instance_type
  update_default_version = true
  iam_instance_profile {
    name = var.instance_profile_name
  }

  network_interfaces {
    device_index                = 0
    associate_public_ip_address = true
    security_groups             = [var.app_sg_id]
  }

  block_device_mappings {
    device_name = "/dev/xvda"
    ebs {
      volume_size = var.root_volume_gb
      volume_type = "gp3"
      encrypted   = true
    }
  }
  user_data = base64encode(var.user_data)

  tags = {
    Name = "${var.name_prefix}-lt"
  }
}

resource "aws_autoscaling_group" "asg" {
  name                      = "${var.name_prefix}-asg"
  max_size                  = 1
  min_size                  = 1
  desired_capacity          = 1
  vpc_zone_identifier       = var.subnets
  health_check_type         = "ELB"
  health_check_grace_period = 300

  launch_template {
    id      = aws_launch_template.lt.id
    version = aws_launch_template.lt.latest_version
  }

  target_group_arns = var.target_group_arns

  tag {
    key                 = "Name"
    value               = var.name_prefix
    propagate_at_launch = true
  }
  tag {
    key                 = "UserDataHash"
    value               = var.user_data_hash
    propagate_at_launch = true
  }

  instance_refresh {
    strategy = "Rolling"
    preferences {
      min_healthy_percentage = 90
      instance_warmup        = 60
    }
  }
}
