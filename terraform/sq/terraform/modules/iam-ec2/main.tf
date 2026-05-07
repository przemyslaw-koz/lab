data "aws_iam_policy_document" "assume_ec2" {
  statement {
    sid     = "EC2AssumeRole"
    effect  = "Allow"
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "ec2" {
  name               = "${var.name_prefix}-ec2-role"
  assume_role_policy = data.aws_iam_policy_document.assume_ec2.json
}

data "aws_iam_policy_document" "ssm_read" {
  statement {
    sid    = "ReadDbPasswordParam"
    effect = "Allow"
    actions = [
      "ssm:GetParameter",
      "ssm:GetParameters",
      "ssm:GetParameterHistory"
    ]
    resources = [var.ssm_parameter_arn]
  }

  statement {
    sid       = "DecryptDbPassword"
    effect    = "Allow"
    actions   = ["kms:Decrypt"]
    resources = var.allow_kms_key_arns
  }
}

resource "aws_iam_policy" "ssm_read" {
  name   = "${var.name_prefix}-ssm-read"
  policy = data.aws_iam_policy_document.ssm_read.json
}

resource "aws_iam_role_policy_attachment" "attach_ssm" {
  role       = aws_iam_role.ec2.name
  policy_arn = aws_iam_policy.ssm_read.arn
}

resource "aws_iam_role_policy_attachment" "attach_ssm_core" {
  role       = aws_iam_role.ec2.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_role_policy_attachment" "attach_ecr_readonly" {
  role       = aws_iam_role.ec2.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

resource "aws_iam_instance_profile" "ec2" {
  name = "${var.name_prefix}-instance-profile"
  role = aws_iam_role.ec2.name
}
