#
# API Function /forum
#
resource "aws_api_gateway_resource" "forum" {
  path_part   = "forum"
  parent_id   = aws_api_gateway_rest_api.vinyl-lk.root_resource_id
  rest_api_id = aws_api_gateway_rest_api.vinyl-lk.id
}

# ANY
resource "aws_api_gateway_method" "any_forum" {
  rest_api_id   = aws_api_gateway_resource.forum.rest_api_id
  resource_id   = aws_api_gateway_resource.forum.id
  http_method   = "ANY"
  authorization = "NONE"
}

resource "aws_api_gateway_method_response" "any_forum" {
  rest_api_id = aws_api_gateway_method.any_forum.rest_api_id
  resource_id = aws_api_gateway_method.any_forum.resource_id
  http_method = aws_api_gateway_method.any_forum.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }

  response_models = {
    "application/json" = "Empty"
  }
}

#
# API Function /forum/{proxy+}
#
resource "aws_api_gateway_resource" "forum_proxy" {
  path_part   = "{proxy+}"
  parent_id   = aws_api_gateway_resource.forum.id
  rest_api_id = aws_api_gateway_rest_api.vinyl-lk.id
}

# ANY
resource "aws_api_gateway_method" "any_forum_proxy" {
  rest_api_id   = aws_api_gateway_resource.forum_proxy.rest_api_id
  resource_id   = aws_api_gateway_resource.forum_proxy.id
  http_method   = "ANY"
  authorization = "NONE"

  request_parameters = {
    "method.request.path.proxy" = true
  }
}

resource "aws_api_gateway_method_response" "any_forum_proxy" {
  rest_api_id = aws_api_gateway_method.any_forum_proxy.rest_api_id
  resource_id = aws_api_gateway_method.any_forum_proxy.resource_id
  http_method = aws_api_gateway_method.any_forum_proxy.http_method
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
module "cors-forum" {
  source  = "squidfunk/api-gateway-enable-cors/aws"
  version = "0.3.3"

  api_id          = aws_api_gateway_rest_api.vinyl-lk.id
  api_resource_id = aws_api_gateway_resource.forum.id
}

module "cors-forum_proxy" {
  source  = "squidfunk/api-gateway-enable-cors/aws"
  version = "0.3.3"

  api_id          = aws_api_gateway_rest_api.vinyl-lk.id
  api_resource_id = aws_api_gateway_resource.forum_proxy.id
}

#
# Integrations
#
resource "aws_api_gateway_integration" "any_forum" {
  rest_api_id             = aws_api_gateway_rest_api.vinyl-lk.id
  resource_id             = aws_api_gateway_resource.forum.id
  http_method             = aws_api_gateway_method.any_forum.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = module.lambda-forum-service.lambda_function_invoke_arn
}

resource "aws_api_gateway_integration_response" "any_forum" {
  rest_api_id = aws_api_gateway_integration.any_forum.rest_api_id
  resource_id = aws_api_gateway_integration.any_forum.resource_id
  http_method = aws_api_gateway_integration.any_forum.http_method
  status_code = aws_api_gateway_method_response.any_forum.status_code

  response_templates = {
    "application/json" = ""
  }

  depends_on = [aws_api_gateway_integration.any_forum]
}

resource "aws_api_gateway_integration" "any_forum_proxy" {
  rest_api_id             = aws_api_gateway_rest_api.vinyl-lk.id
  resource_id             = aws_api_gateway_resource.forum_proxy.id
  http_method             = aws_api_gateway_method.any_forum_proxy.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = module.lambda-forum-service.lambda_function_invoke_arn
}

resource "aws_api_gateway_integration_response" "any_forum_proxy" {
  rest_api_id = aws_api_gateway_integration.any_forum_proxy.rest_api_id
  resource_id = aws_api_gateway_integration.any_forum_proxy.resource_id
  http_method = aws_api_gateway_integration.any_forum_proxy.http_method
  status_code = aws_api_gateway_method_response.any_forum_proxy.status_code

  response_templates = {
    "application/json" = ""
  }

  depends_on = [aws_api_gateway_integration.any_forum_proxy]
}

#
# Permissions
#
resource "aws_lambda_permission" "get-forum" {
  statement_id  = "api-allow-forum-${terraform.workspace}"
  action        = "lambda:InvokeFunction"
  function_name = module.lambda-forum-service.lambda_function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.vinyl-lk.execution_arn}/*"
}
