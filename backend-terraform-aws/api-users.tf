
#
# API Function /users
#
resource "aws_api_gateway_resource" "users" {
  path_part   = "users"
  parent_id   = aws_api_gateway_rest_api.vinyl-lk.root_resource_id
  rest_api_id = aws_api_gateway_rest_api.vinyl-lk.id
}

# GET
resource "aws_api_gateway_method" "get_users" {
  rest_api_id   = aws_api_gateway_resource.users.rest_api_id
  resource_id   = aws_api_gateway_resource.users.id
  http_method   = "GET"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.vinyl-lk-authorizer.id
}

resource "aws_api_gateway_method_response" "get_users" {
  rest_api_id = aws_api_gateway_method.get_users.rest_api_id
  resource_id = aws_api_gateway_method.get_users.resource_id
  http_method = aws_api_gateway_method.get_users.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }

  response_models = {
    "application/json" = "Empty"
  }
}

# POST
resource "aws_api_gateway_method" "post_users" {
  rest_api_id   = aws_api_gateway_resource.users.rest_api_id
  resource_id   = aws_api_gateway_resource.users.id
  http_method   = "POST"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.vinyl-lk-authorizer.id
}

resource "aws_api_gateway_method_response" "post_users" {
  rest_api_id = aws_api_gateway_method.post_users.rest_api_id
  resource_id = aws_api_gateway_method.post_users.resource_id
  http_method = aws_api_gateway_method.post_users.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }

  response_models = {
    "application/json" = "Empty"
  }
}

#
# API Function /users/forum
#
resource "aws_api_gateway_resource" "users_forum" {
  path_part   = "forum"
  parent_id   = aws_api_gateway_resource.users.id
  rest_api_id = aws_api_gateway_rest_api.vinyl-lk.id
}

# GET
resource "aws_api_gateway_method" "get_users_forum" {
  rest_api_id   = aws_api_gateway_resource.users_forum.rest_api_id
  resource_id   = aws_api_gateway_resource.users_forum.id
  http_method   = "GET"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.vinyl-lk-authorizer.id
}

resource "aws_api_gateway_method_response" "get_users_forum" {
  rest_api_id = aws_api_gateway_method.get_users_forum.rest_api_id
  resource_id = aws_api_gateway_method.get_users_forum.resource_id
  http_method = aws_api_gateway_method.get_users_forum.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }

  response_models = {
    "application/json" = "Empty"
  }
}

#
# API Function /users/forum/{postId}
#
resource "aws_api_gateway_resource" "users_forum_id" {
  path_part   = "{postId}"
  parent_id   = aws_api_gateway_resource.users_forum.id
  rest_api_id = aws_api_gateway_rest_api.vinyl-lk.id
}

# DELETE
resource "aws_api_gateway_method" "delete_users_forum_id" {
  rest_api_id   = aws_api_gateway_resource.users_forum_id.rest_api_id
  resource_id   = aws_api_gateway_resource.users_forum_id.id
  http_method   = "DELETE"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.vinyl-lk-authorizer.id
}

resource "aws_api_gateway_method_response" "delete_users_forum_id" {
  rest_api_id = aws_api_gateway_method.delete_users_forum_id.rest_api_id
  resource_id = aws_api_gateway_method.delete_users_forum_id.resource_id
  http_method = aws_api_gateway_method.delete_users_forum_id.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }

  response_models = {
    "application/json" = "Empty"
  }
}

#
# API Function /users/records
#
resource "aws_api_gateway_resource" "users_records" {
  path_part   = "records"
  parent_id   = aws_api_gateway_resource.users.id
  rest_api_id = aws_api_gateway_rest_api.vinyl-lk.id
}

# GET
resource "aws_api_gateway_method" "get_users_records" {
  rest_api_id   = aws_api_gateway_resource.users_records.rest_api_id
  resource_id   = aws_api_gateway_resource.users_records.id
  http_method   = "GET"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.vinyl-lk-authorizer.id
}

resource "aws_api_gateway_method_response" "get_users_records" {
  rest_api_id = aws_api_gateway_method.get_users_records.rest_api_id
  resource_id = aws_api_gateway_method.get_users_records.resource_id
  http_method = aws_api_gateway_method.get_users_records.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }

  response_models = {
    "application/json" = "Empty"
  }
}

#
# API Function /users/records/{recordId}
#
resource "aws_api_gateway_resource" "users_records_id" {
  path_part   = "{recordId}"
  parent_id   = aws_api_gateway_resource.users_records.id
  rest_api_id = aws_api_gateway_rest_api.vinyl-lk.id
}

# DELETE
resource "aws_api_gateway_method" "delete_users_records_id" {
  rest_api_id   = aws_api_gateway_resource.users_records_id.rest_api_id
  resource_id   = aws_api_gateway_resource.users_records_id.id
  http_method   = "DELETE"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.vinyl-lk-authorizer.id

  request_parameters = {
    "method.request.path.recordId" = true
  }
}

resource "aws_api_gateway_method_response" "delete_users_records_id" {
  rest_api_id = aws_api_gateway_method.delete_users_records_id.rest_api_id
  resource_id = aws_api_gateway_method.delete_users_records_id.resource_id
  http_method = aws_api_gateway_method.delete_users_records_id.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }

  response_models = {
    "application/json" = "Empty"
  }
}

#
# API Function /users/market
#
resource "aws_api_gateway_resource" "users_market" {
  path_part   = "market"
  parent_id   = aws_api_gateway_resource.users.id
  rest_api_id = aws_api_gateway_rest_api.vinyl-lk.id
}

# GET
resource "aws_api_gateway_method" "get_users_market" {
  rest_api_id   = aws_api_gateway_resource.users_market.rest_api_id
  resource_id   = aws_api_gateway_resource.users_market.id
  http_method   = "GET"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.vinyl-lk-authorizer.id
}

resource "aws_api_gateway_method_response" "get_users_market" {
  rest_api_id = aws_api_gateway_method.get_users_market.rest_api_id
  resource_id = aws_api_gateway_method.get_users_market.resource_id
  http_method = aws_api_gateway_method.get_users_market.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }

  response_models = {
    "application/json" = "Empty"
  }
}

#
# API Function /users/market/{postId}
#
resource "aws_api_gateway_resource" "users_market_id" {
  path_part   = "{postId}"
  parent_id   = aws_api_gateway_resource.users_market.id
  rest_api_id = aws_api_gateway_rest_api.vinyl-lk.id
}

# DELETE
resource "aws_api_gateway_method" "delete_users_market_id" {
  rest_api_id   = aws_api_gateway_resource.users_market_id.rest_api_id
  resource_id   = aws_api_gateway_resource.users_market_id.id
  http_method   = "DELETE"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.vinyl-lk-authorizer.id

  request_parameters = {
    "method.request.path.postId" = true
  }
}

resource "aws_api_gateway_method_response" "delete_users_market_id" {
  rest_api_id = aws_api_gateway_method.delete_users_market_id.rest_api_id
  resource_id = aws_api_gateway_method.delete_users_market_id.resource_id
  http_method = aws_api_gateway_method.delete_users_market_id.http_method
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

module "cors-users_forum" {
  source  = "squidfunk/api-gateway-enable-cors/aws"
  version = "0.3.3"

  api_id          = aws_api_gateway_rest_api.vinyl-lk.id
  api_resource_id = aws_api_gateway_resource.users_forum.id
}

module "cors-users_forum_id" {
  source  = "squidfunk/api-gateway-enable-cors/aws"
  version = "0.3.3"

  api_id          = aws_api_gateway_rest_api.vinyl-lk.id
  api_resource_id = aws_api_gateway_resource.users_forum_id.id
}

module "cors-users_market" {
  source  = "squidfunk/api-gateway-enable-cors/aws"
  version = "0.3.3"

  api_id          = aws_api_gateway_rest_api.vinyl-lk.id
  api_resource_id = aws_api_gateway_resource.users_market.id
}

module "cors-users_records" {
  source  = "squidfunk/api-gateway-enable-cors/aws"
  version = "0.3.3"

  api_id          = aws_api_gateway_rest_api.vinyl-lk.id
  api_resource_id = aws_api_gateway_resource.users_records.id
}

module "cors-users_records_id" {
  source  = "squidfunk/api-gateway-enable-cors/aws"
  version = "0.3.3"

  api_id          = aws_api_gateway_rest_api.vinyl-lk.id
  api_resource_id = aws_api_gateway_resource.users_records_id.id
}

module "cors-users_market_id" {
  source  = "squidfunk/api-gateway-enable-cors/aws"
  version = "0.3.3"

  api_id          = aws_api_gateway_rest_api.vinyl-lk.id
  api_resource_id = aws_api_gateway_resource.users_market_id.id
}

# 
# Integrations
# 
resource "aws_api_gateway_integration" "get_users" {
  rest_api_id             = aws_api_gateway_rest_api.vinyl-lk.id
  resource_id             = aws_api_gateway_resource.users.id
  http_method             = aws_api_gateway_method.get_users.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = module.lambda-user-service.lambda_function_invoke_arn
}

resource "aws_api_gateway_integration_response" "get_users" {
  rest_api_id = aws_api_gateway_integration.get_users.rest_api_id
  resource_id = aws_api_gateway_integration.get_users.resource_id
  http_method = aws_api_gateway_integration.get_users.http_method
  status_code = aws_api_gateway_method_response.get_users.status_code

  response_templates = {
    "application/json" = ""
  }

  depends_on = [aws_api_gateway_integration.get_users]
}

resource "aws_api_gateway_integration" "post_users" {
  rest_api_id             = aws_api_gateway_rest_api.vinyl-lk.id
  resource_id             = aws_api_gateway_resource.users.id
  http_method             = aws_api_gateway_method.post_users.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = module.lambda-user-service.lambda_function_invoke_arn
}

resource "aws_api_gateway_integration_response" "post_users" {
  rest_api_id = aws_api_gateway_integration.post_users.rest_api_id
  resource_id = aws_api_gateway_integration.post_users.resource_id
  http_method = aws_api_gateway_integration.post_users.http_method
  status_code = aws_api_gateway_method_response.post_users.status_code

  response_templates = {
    "application/json" = ""
  }

  depends_on = [aws_api_gateway_integration.post_users]
}

resource "aws_api_gateway_integration" "get_users_forum" {
  rest_api_id             = aws_api_gateway_rest_api.vinyl-lk.id
  resource_id             = aws_api_gateway_resource.users_forum.id
  http_method             = aws_api_gateway_method.get_users_forum.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = module.lambda-user-service.lambda_function_invoke_arn
}

resource "aws_api_gateway_integration_response" "get_users_forum" {
  rest_api_id = aws_api_gateway_integration.get_users_forum.rest_api_id
  resource_id = aws_api_gateway_integration.get_users_forum.resource_id
  http_method = aws_api_gateway_integration.get_users_forum.http_method
  status_code = aws_api_gateway_method_response.get_users_forum.status_code

  response_templates = {
    "application/json" = ""
  }

  depends_on = [aws_api_gateway_integration.get_users_forum]
}

resource "aws_api_gateway_integration" "delete_users_forum_id" {
  rest_api_id             = aws_api_gateway_rest_api.vinyl-lk.id
  resource_id             = aws_api_gateway_resource.users_forum_id.id
  http_method             = aws_api_gateway_method.delete_users_forum_id.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = module.lambda-user-service.lambda_function_invoke_arn
}

resource "aws_api_gateway_integration_response" "delete_users_forum_id" {
  rest_api_id = aws_api_gateway_integration.delete_users_forum_id.rest_api_id
  resource_id = aws_api_gateway_integration.delete_users_forum_id.resource_id
  http_method = aws_api_gateway_integration.delete_users_forum_id.http_method
  status_code = aws_api_gateway_method_response.delete_users_forum_id.status_code

  response_templates = {
    "application/json" = ""
  }

  depends_on = [aws_api_gateway_integration.delete_users_forum_id]
}

resource "aws_api_gateway_integration" "get_users_market" {
  rest_api_id             = aws_api_gateway_rest_api.vinyl-lk.id
  resource_id             = aws_api_gateway_resource.users_market.id
  http_method             = aws_api_gateway_method.get_users_market.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = module.lambda-user-service.lambda_function_invoke_arn
}

resource "aws_api_gateway_integration_response" "get_users_market" {
  rest_api_id = aws_api_gateway_integration.get_users_market.rest_api_id
  resource_id = aws_api_gateway_integration.get_users_market.resource_id
  http_method = aws_api_gateway_integration.get_users_market.http_method
  status_code = aws_api_gateway_method_response.get_users_market.status_code

  response_templates = {
    "application/json" = ""
  }

  depends_on = [aws_api_gateway_integration.get_users_market]
}

resource "aws_api_gateway_integration" "delete_users_market_id" {
  rest_api_id             = aws_api_gateway_rest_api.vinyl-lk.id
  resource_id             = aws_api_gateway_resource.users_market_id.id
  http_method             = aws_api_gateway_method.delete_users_market_id.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = module.lambda-user-service.lambda_function_invoke_arn
}

resource "aws_api_gateway_integration_response" "delete_users_market_id" {
  rest_api_id = aws_api_gateway_integration.delete_users_market_id.rest_api_id
  resource_id = aws_api_gateway_integration.delete_users_market_id.resource_id
  http_method = aws_api_gateway_integration.delete_users_market_id.http_method
  status_code = aws_api_gateway_method_response.delete_users_market_id.status_code

  response_templates = {
    "application/json" = ""
  }

  depends_on = [aws_api_gateway_integration.delete_users_market_id]
}

resource "aws_api_gateway_integration" "get_users_records" {
  rest_api_id             = aws_api_gateway_rest_api.vinyl-lk.id
  resource_id             = aws_api_gateway_resource.users_records.id
  http_method             = aws_api_gateway_method.get_users_records.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = module.lambda-user-service.lambda_function_invoke_arn
}

resource "aws_api_gateway_integration_response" "get_users_records" {
  rest_api_id = aws_api_gateway_integration.get_users_records.rest_api_id
  resource_id = aws_api_gateway_integration.get_users_records.resource_id
  http_method = aws_api_gateway_integration.get_users_records.http_method
  status_code = aws_api_gateway_method_response.get_users_records.status_code

  response_templates = {
    "application/json" = ""
  }

  depends_on = [aws_api_gateway_integration.get_users_records]
}

resource "aws_api_gateway_integration" "delete_users_records_id" {
  rest_api_id             = aws_api_gateway_rest_api.vinyl-lk.id
  resource_id             = aws_api_gateway_resource.users_records_id.id
  http_method             = aws_api_gateway_method.delete_users_records_id.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = module.lambda-user-service.lambda_function_invoke_arn
}

resource "aws_api_gateway_integration_response" "delete_users_records_id" {
  rest_api_id = aws_api_gateway_integration.delete_users_records_id.rest_api_id
  resource_id = aws_api_gateway_integration.delete_users_records_id.resource_id
  http_method = aws_api_gateway_integration.delete_users_records_id.http_method
  status_code = aws_api_gateway_method_response.delete_users_records_id.status_code

  response_templates = {
    "application/json" = ""
  }

  depends_on = [aws_api_gateway_integration.delete_users_records_id]
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
