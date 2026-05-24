#
# API Function /users
#
resource "aws_api_gateway_resource" "users" {
  path_part   = "users"
  parent_id   = aws_api_gateway_rest_api.vinyl-lk.root_resource_id
  rest_api_id = aws_api_gateway_rest_api.vinyl-lk.id
}

# ANY
resource "aws_api_gateway_method" "any_users" {
  rest_api_id   = aws_api_gateway_resource.users.rest_api_id
  resource_id   = aws_api_gateway_resource.users.id
  http_method   = "ANY"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.vinyl-lk-authorizer.id
}

resource "aws_api_gateway_method_response" "any_users" {
  rest_api_id = aws_api_gateway_method.any_users.rest_api_id
  resource_id = aws_api_gateway_method.any_users.resource_id
  http_method = aws_api_gateway_method.any_users.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }

  response_models = {
    "application/json" = "Empty"
  }
}

#
# API Function /users/{proxy+}
#
resource "aws_api_gateway_resource" "users_proxy" {
  path_part   = "{proxy+}"
  parent_id   = aws_api_gateway_resource.users.id
  rest_api_id = aws_api_gateway_rest_api.vinyl-lk.id
}

# ANY
resource "aws_api_gateway_method" "any_users_proxy" {
  rest_api_id   = aws_api_gateway_resource.users_proxy.rest_api_id
  resource_id   = aws_api_gateway_resource.users_proxy.id
  http_method   = "ANY"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.vinyl-lk-authorizer.id

  request_parameters = {
    "method.request.path.proxy" = true
  }
}

resource "aws_api_gateway_method_response" "any_users_proxy" {
  rest_api_id = aws_api_gateway_method.any_users_proxy.rest_api_id
  resource_id = aws_api_gateway_method.any_users_proxy.resource_id
  http_method = aws_api_gateway_method.any_users_proxy.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }

  response_models = {
    "application/json" = "Empty"
  }
}

#
# CORS
#
module "cors-users" {
  source  = "squidfunk/api-gateway-enable-cors/aws"
  version = "0.3.3"

  api_id          = aws_api_gateway_rest_api.vinyl-lk.id
  api_resource_id = aws_api_gateway_resource.users.id
}

module "cors-users_proxy" {
  source  = "squidfunk/api-gateway-enable-cors/aws"
  version = "0.3.3"

  api_id          = aws_api_gateway_rest_api.vinyl-lk.id
  api_resource_id = aws_api_gateway_resource.users_proxy.id
}

#
# Integrations
#
resource "aws_api_gateway_integration" "any_users" {
  rest_api_id             = aws_api_gateway_rest_api.vinyl-lk.id
  resource_id             = aws_api_gateway_resource.users.id
  http_method             = aws_api_gateway_method.any_users.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = module.lambda-user-service.lambda_function_invoke_arn
}

resource "aws_api_gateway_integration_response" "any_users" {
  rest_api_id = aws_api_gateway_integration.any_users.rest_api_id
  resource_id = aws_api_gateway_integration.any_users.resource_id
  http_method = aws_api_gateway_integration.any_users.http_method
  status_code = aws_api_gateway_method_response.any_users.status_code

  response_templates = {
    "application/json" = ""
  }

  depends_on = [aws_api_gateway_integration.any_users]
}

resource "aws_api_gateway_integration" "any_users_proxy" {
  rest_api_id             = aws_api_gateway_rest_api.vinyl-lk.id
  resource_id             = aws_api_gateway_resource.users_proxy.id
  http_method             = aws_api_gateway_method.any_users_proxy.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = module.lambda-user-service.lambda_function_invoke_arn
}

resource "aws_api_gateway_integration_response" "any_users_proxy" {
  rest_api_id = aws_api_gateway_integration.any_users_proxy.rest_api_id
  resource_id = aws_api_gateway_integration.any_users_proxy.resource_id
  http_method = aws_api_gateway_integration.any_users_proxy.http_method
  status_code = aws_api_gateway_method_response.any_users_proxy.status_code

  response_templates = {
    "application/json" = ""
  }

  depends_on = [aws_api_gateway_integration.any_users_proxy]
}

#
# Permissions
#
resource "aws_lambda_permission" "get-users" {
  statement_id  = "api-allow-users-${terraform.workspace}"
  action        = "lambda:InvokeFunction"
  function_name = module.lambda-user-service.lambda_function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.vinyl-lk.execution_arn}/*"
}
