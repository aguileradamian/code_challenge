locals {
  lambda_folder = "../lambdas"
  entities        = ["albums", "tracks", "artists", "tables"]
  entities_length = length(local.entities)
}

###########################################################################################
# API GATEWAY RESOURCES
###########################################################################################

# API Gateway
resource "aws_api_gateway_rest_api" "api" {
  name = "challenge"
}

# API Gateway Deployment
resource "aws_api_gateway_deployment" "deploy" {
  depends_on = [aws_api_gateway_integration.post]

  rest_api_id = aws_api_gateway_rest_api.api.id
  stage_name  = "challenge"

  lifecycle {
    create_before_destroy = true
  }
}

# API Gateway Resources
resource "aws_api_gateway_resource" "resources" {
  count       = local.entities_length
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_rest_api.api.root_resource_id
  path_part   = local.entities[count.index]
}

# API Gateway Method
resource "aws_api_gateway_method" "post" {
  count         = local.entities_length
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.resources[count.index].id
  http_method   = "POST"
  authorization = "NONE"
}

# API Gateway Integration
resource "aws_api_gateway_integration" "post" {
  count                   = local.entities_length
  rest_api_id             = aws_api_gateway_rest_api.api.id
  resource_id             = aws_api_gateway_resource.resources[count.index].id
  integration_http_method = "POST"
  http_method             = "POST"
  type                    = "AWS"
  uri                     = aws_lambda_function.lambda[count.index].invoke_arn
  credentials             = aws_iam_role.api.arn
}

# API Gateway Integration Response
resource "aws_api_gateway_integration_response" "int_response" {
  depends_on = [aws_api_gateway_integration.post]
  count       = local.entities_length
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.resources[count.index].id
  http_method = aws_api_gateway_method.post[count.index].http_method
  status_code = "200"
}

# API Gateway Response
resource "aws_api_gateway_method_response" "response" {
  count       = local.entities_length
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.resources[count.index].id
  http_method = aws_api_gateway_method.post[count.index].http_method
  status_code = "200"
}

###########################################################################################
# LAMBDA RESOURCES
###########################################################################################

# Lambdas - albums, tracks, artists, tables
resource "aws_lambda_function" "lambda" {
  count            = local.entities_length
  function_name    = local.entities[count.index]
  filename         = "${local.lambda_folder}/${local.entities[count.index]}.zip"
  source_code_hash = filebase64sha256("${local.lambda_folder}/${local.entities[count.index]}.zip")
  role             = aws_iam_role.lambda.arn
  handler          = "index.handler"
  runtime          = "nodejs12.x"
  timeout          = "300"

  environment {
    variables = {
      sqlHost = aws_db_instance.db.address
      sqlUser = aws_db_instance.db.username
      sqlPass = aws_db_instance.db.password
    }
  }
}

# Permissions for API Gateway to call Lambda
resource "aws_lambda_permission" "permissions" {
  count         = local.entities_length
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.lambda[count.index].function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.api.execution_arn}/*/*/*"
}

###########################################################################################
# IAM RESOURCES
###########################################################################################

# Role for API Gateway
resource "aws_iam_role" "api" {
  name = "api-role"

  assume_role_policy = <<-EOF
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Action": "sts:AssumeRole",
        "Principal": {
          "Service": "apigateway.amazonaws.com"
        },
        "Effect": "Allow",
        "Sid": ""
      }
    ]
  }
  EOF
}

# Policy for the API Gateway Role
resource "aws_iam_role_policy_attachment" "api-policy" {
  role       = aws_iam_role.api.name
  policy_arn = "arn:aws:iam::aws:policy/AWSLambdaFullAccess"
}

# Role for all the Lambdas
resource "aws_iam_role" "lambda" {
  name = "lambda-role"

  assume_role_policy = <<-EOF
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Action": "sts:AssumeRole",
        "Principal": {
          "Service": "lambda.amazonaws.com"
        },
        "Effect": "Allow",
        "Sid": ""
      }
    ]
  }
  EOF
}

# Policy for the Lambda Role
resource "aws_iam_role_policy_attachment" "lambda-policy" {
  role       = aws_iam_role.lambda.name
  policy_arn = "arn:aws:iam::aws:policy/AWSLambdaExecute"
}

###########################################################################################
# DATABASE RESOURCES
###########################################################################################

# RDS MySQL Database
resource "aws_db_instance" "db" {
  identifier             = "challenge"
  name                   = "challengedb"
  engine                 = "mysql"
  engine_version         = "5.7"
  allocated_storage      = 5
  storage_type           = "standard"
  instance_class         = "db.t2.micro"
  username               = "admin"
  password               = "d!nxaYQ;T?u($9y*"
  publicly_accessible    = true
  skip_final_snapshot    = true
  vpc_security_group_ids = [aws_security_group.sg.id]
}

# Security Group to allow connectivity to the DB
resource "aws_security_group" "sg" {
  name = "db_sg"

  ingress {
    from_port   = 3306
    to_port     = 3306
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 3306
    to_port     = 3306
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

}