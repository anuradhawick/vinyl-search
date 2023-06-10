
#
# API Function /admin
#
resource "aws_api_gateway_resource" "admin" {
  path_part   = "admin"
  parent_id   = aws_api_gateway_rest_api.vinyl-lk.root_resource_id
  rest_api_id = aws_api_gateway_rest_api.vinyl-lk.id
}

#
# API Function /admin/admin-users
#
resource "aws_api_gateway_resource" "admin_admin-users" {
  path_part   = "admin-users"
  parent_id   = aws_api_gateway_resource.admin.id
  rest_api_id = aws_api_gateway_rest_api.vinyl-lk.id
}

# GET
resource "aws_api_gateway_method" "get_admin_admin-users" {
  rest_api_id   = aws_api_gateway_resource.admin_admin-users.rest_api_id
  resource_id   = aws_api_gateway_resource.admin_admin-users.id
  http_method   = "GET"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.vinyl-lk-authorizer.id
}

resource "aws_api_gateway_method_response" "get_admin_admin-users" {
  rest_api_id = aws_api_gateway_method.get_admin_admin-users.rest_api_id
  resource_id = aws_api_gateway_method.get_admin_admin-users.resource_id
  http_method = aws_api_gateway_method.get_admin_admin-users.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }

  response_models = {
    "application/json" = "Empty"
  }
}

#
# API Function /admin/admin-users/{userId}
#
resource "aws_api_gateway_resource" "admin_admin-users_id" {
  path_part   = "{userId}"
  parent_id   = aws_api_gateway_resource.admin_admin-users.id
  rest_api_id = aws_api_gateway_rest_api.vinyl-lk.id
}

# DELETE
resource "aws_api_gateway_method" "delete_admin_admin-users_id" {
  rest_api_id   = aws_api_gateway_resource.admin_admin-users_id.rest_api_id
  resource_id   = aws_api_gateway_resource.admin_admin-users_id.id
  http_method   = "DELETE"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.vinyl-lk-authorizer.id

  request_parameters = {
    "method.request.path.recordId" = true
  }
}

resource "aws_api_gateway_method_response" "delete_admin_admin-users_id" {
  rest_api_id = aws_api_gateway_method.delete_admin_admin-users_id.rest_api_id
  resource_id = aws_api_gateway_method.delete_admin_admin-users_id.resource_id
  http_method = aws_api_gateway_method.delete_admin_admin-users_id.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }

  response_models = {
    "application/json" = "Empty"
  }
}

# POST
resource "aws_api_gateway_method" "post_admin_admin-users_id" {
  rest_api_id   = aws_api_gateway_resource.admin_admin-users_id.rest_api_id
  resource_id   = aws_api_gateway_resource.admin_admin-users_id.id
  http_method   = "POST"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.vinyl-lk-authorizer.id

  request_parameters = {
    "method.request.path.recordId" = true
  }
}

resource "aws_api_gateway_method_response" "post_admin_admin-users_id" {
  rest_api_id = aws_api_gateway_method.post_admin_admin-users_id.rest_api_id
  resource_id = aws_api_gateway_method.post_admin_admin-users_id.resource_id
  http_method = aws_api_gateway_method.post_admin_admin-users_id.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }

  response_models = {
    "application/json" = "Empty"
  }
}

#
# API Function /admin/forum
#
resource "aws_api_gateway_resource" "admin_forum" {
  path_part   = "forum"
  parent_id   = aws_api_gateway_resource.admin.id
  rest_api_id = aws_api_gateway_rest_api.vinyl-lk.id
}

# GET
resource "aws_api_gateway_method" "get_admin_forum" {
  rest_api_id   = aws_api_gateway_resource.admin_forum.rest_api_id
  resource_id   = aws_api_gateway_resource.admin_forum.id
  http_method   = "GET"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.vinyl-lk-authorizer.id

  request_parameters = {
    "method.request.path.recordId" = true
  }
}

resource "aws_api_gateway_method_response" "get_admin_forum" {
  rest_api_id = aws_api_gateway_method.get_admin_forum.rest_api_id
  resource_id = aws_api_gateway_method.get_admin_forum.resource_id
  http_method = aws_api_gateway_method.get_admin_forum.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }

  response_models = {
    "application/json" = "Empty"
  }
}

#
# API Function /admin/forum/{postId}
#
resource "aws_api_gateway_resource" "admin_forum_post_id" {
  path_part   = "{postId}"
  parent_id   = aws_api_gateway_resource.admin_forum.id
  rest_api_id = aws_api_gateway_rest_api.vinyl-lk.id
}

# DELETE
resource "aws_api_gateway_method" "delete_admin_forum_post_id" {
  rest_api_id   = aws_api_gateway_resource.admin_forum_post_id.rest_api_id
  resource_id   = aws_api_gateway_resource.admin_forum_post_id.id
  http_method   = "DELETE"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.vinyl-lk-authorizer.id

  request_parameters = {
    "method.request.path.postId" = true
  }
}

resource "aws_api_gateway_method_response" "delete_admin_forum_post_id" {
  rest_api_id = aws_api_gateway_method.delete_admin_forum_post_id.rest_api_id
  resource_id = aws_api_gateway_method.delete_admin_forum_post_id.resource_id
  http_method = aws_api_gateway_method.delete_admin_forum_post_id.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }

  response_models = {
    "application/json" = "Empty"
  }
}

#
# API Function /admin/records
#
resource "aws_api_gateway_resource" "admin_records" {
  path_part   = "records"
  parent_id   = aws_api_gateway_resource.admin.id
  rest_api_id = aws_api_gateway_rest_api.vinyl-lk.id
}

# GET
resource "aws_api_gateway_method" "get_admin_records" {
  rest_api_id   = aws_api_gateway_resource.admin_records.rest_api_id
  resource_id   = aws_api_gateway_resource.admin_records.id
  http_method   = "GET"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.vinyl-lk-authorizer.id
}

resource "aws_api_gateway_method_response" "get_admin_records" {
  rest_api_id = aws_api_gateway_method.get_admin_records.rest_api_id
  resource_id = aws_api_gateway_method.get_admin_records.resource_id
  http_method = aws_api_gateway_method.get_admin_records.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }

  response_models = {
    "application/json" = "Empty"
  }
}

#
# API Function /admin/records/{recordId}
#
resource "aws_api_gateway_resource" "admin_records_post_id" {
  path_part   = "{recordId}"
  parent_id   = aws_api_gateway_resource.admin_records.id
  rest_api_id = aws_api_gateway_rest_api.vinyl-lk.id
}

# DELETE
resource "aws_api_gateway_method" "delete_admin_records_post_id" {
  rest_api_id   = aws_api_gateway_resource.admin_records_post_id.rest_api_id
  resource_id   = aws_api_gateway_resource.admin_records_post_id.id
  http_method   = "DELETE"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.vinyl-lk-authorizer.id

  request_parameters = {
    "method.request.path.recordId" = true
  }
}

resource "aws_api_gateway_method_response" "delete_admin_records_post_id" {
  rest_api_id = aws_api_gateway_method.delete_admin_records_post_id.rest_api_id
  resource_id = aws_api_gateway_method.delete_admin_records_post_id.resource_id
  http_method = aws_api_gateway_method.delete_admin_records_post_id.http_method
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
module "cors-admin_admin-users" {
  source  = "squidfunk/api-gateway-enable-cors/aws"
  version = "0.3.3"

  api_id          = aws_api_gateway_rest_api.vinyl-lk.id
  api_resource_id = aws_api_gateway_resource.admin_admin-users.id
}

module "cors-admin_admin-users_id" {
  source  = "squidfunk/api-gateway-enable-cors/aws"
  version = "0.3.3"

  api_id          = aws_api_gateway_rest_api.vinyl-lk.id
  api_resource_id = aws_api_gateway_resource.admin_admin-users_id.id
}

module "cors-admin_forum" {
  source  = "squidfunk/api-gateway-enable-cors/aws"
  version = "0.3.3"

  api_id          = aws_api_gateway_rest_api.vinyl-lk.id
  api_resource_id = aws_api_gateway_resource.admin_forum.id
}

module "cors-admin_forum_post_id" {
  source  = "squidfunk/api-gateway-enable-cors/aws"
  version = "0.3.3"

  api_id          = aws_api_gateway_rest_api.vinyl-lk.id
  api_resource_id = aws_api_gateway_resource.admin_forum_post_id.id
}

module "cors-admin_records" {
  source  = "squidfunk/api-gateway-enable-cors/aws"
  version = "0.3.3"

  api_id          = aws_api_gateway_rest_api.vinyl-lk.id
  api_resource_id = aws_api_gateway_resource.admin_records.id
}

module "cors-admin_records_post_id" {
  source  = "squidfunk/api-gateway-enable-cors/aws"
  version = "0.3.3"

  api_id          = aws_api_gateway_rest_api.vinyl-lk.id
  api_resource_id = aws_api_gateway_resource.admin_records_post_id.id
}


# 
# Integrations
# 
resource "aws_api_gateway_integration" "get_admin_admin-users" {
  rest_api_id             = aws_api_gateway_rest_api.vinyl-lk.id
  resource_id             = aws_api_gateway_resource.admin_admin-users.id
  http_method             = aws_api_gateway_method.get_admin_admin-users.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = module.lambda-admin-service.lambda_function_invoke_arn
}

resource "aws_api_gateway_integration_response" "get_admin_admin-users" {
  rest_api_id = aws_api_gateway_integration.get_admin_admin-users.rest_api_id
  resource_id = aws_api_gateway_integration.get_admin_admin-users.resource_id
  http_method = aws_api_gateway_integration.get_admin_admin-users.http_method
  status_code = aws_api_gateway_method_response.get_admin_admin-users.status_code

  response_templates = {
    "application/json" = ""
  }

  depends_on = [aws_api_gateway_integration.get_admin_admin-users]
}

resource "aws_api_gateway_integration" "delete_admin_admin-users_id" {
  rest_api_id             = aws_api_gateway_rest_api.vinyl-lk.id
  resource_id             = aws_api_gateway_resource.admin_admin-users_id.id
  http_method             = aws_api_gateway_method.delete_admin_admin-users_id.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = module.lambda-admin-service.lambda_function_invoke_arn
}

resource "aws_api_gateway_integration_response" "delete_admin_admin-users_id" {
  rest_api_id = aws_api_gateway_integration.delete_admin_admin-users_id.rest_api_id
  resource_id = aws_api_gateway_integration.delete_admin_admin-users_id.resource_id
  http_method = aws_api_gateway_integration.delete_admin_admin-users_id.http_method
  status_code = aws_api_gateway_method_response.delete_admin_admin-users_id.status_code

  response_templates = {
    "application/json" = ""
  }

  depends_on = [aws_api_gateway_integration.delete_admin_admin-users_id]
}

resource "aws_api_gateway_integration" "post_admin_admin-users_id" {
  rest_api_id             = aws_api_gateway_rest_api.vinyl-lk.id
  resource_id             = aws_api_gateway_resource.admin_admin-users_id.id
  http_method             = aws_api_gateway_method.post_admin_admin-users_id.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = module.lambda-admin-service.lambda_function_invoke_arn
}

resource "aws_api_gateway_integration_response" "post_admin_admin-users_id" {
  rest_api_id = aws_api_gateway_integration.post_admin_admin-users_id.rest_api_id
  resource_id = aws_api_gateway_integration.post_admin_admin-users_id.resource_id
  http_method = aws_api_gateway_integration.post_admin_admin-users_id.http_method
  status_code = aws_api_gateway_method_response.post_admin_admin-users_id.status_code

  response_templates = {
    "application/json" = ""
  }

  depends_on = [aws_api_gateway_integration.post_admin_admin-users_id]
}

resource "aws_api_gateway_integration" "get_admin_forum" {
  rest_api_id             = aws_api_gateway_rest_api.vinyl-lk.id
  resource_id             = aws_api_gateway_resource.admin_forum.id
  http_method             = aws_api_gateway_method.get_admin_forum.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = module.lambda-admin-service.lambda_function_invoke_arn
}

resource "aws_api_gateway_integration_response" "get_admin_forum" {
  rest_api_id = aws_api_gateway_integration.get_admin_forum.rest_api_id
  resource_id = aws_api_gateway_integration.get_admin_forum.resource_id
  http_method = aws_api_gateway_integration.get_admin_forum.http_method
  status_code = aws_api_gateway_method_response.get_admin_forum.status_code

  response_templates = {
    "application/json" = ""
  }

  depends_on = [aws_api_gateway_integration.get_admin_forum]
}

resource "aws_api_gateway_integration" "delete_admin_forum_post_id" {
  rest_api_id             = aws_api_gateway_rest_api.vinyl-lk.id
  resource_id             = aws_api_gateway_resource.admin_forum_post_id.id
  http_method             = aws_api_gateway_method.delete_admin_forum_post_id.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = module.lambda-admin-service.lambda_function_invoke_arn
}

resource "aws_api_gateway_integration_response" "delete_admin_forum_post_id" {
  rest_api_id = aws_api_gateway_integration.delete_admin_forum_post_id.rest_api_id
  resource_id = aws_api_gateway_integration.delete_admin_forum_post_id.resource_id
  http_method = aws_api_gateway_integration.delete_admin_forum_post_id.http_method
  status_code = aws_api_gateway_method_response.delete_admin_forum_post_id.status_code

  response_templates = {
    "application/json" = ""
  }

  depends_on = [aws_api_gateway_integration.delete_admin_forum_post_id]
}

resource "aws_api_gateway_integration" "get_admin_records" {
  rest_api_id             = aws_api_gateway_rest_api.vinyl-lk.id
  resource_id             = aws_api_gateway_resource.admin_records.id
  http_method             = aws_api_gateway_method.get_admin_records.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = module.lambda-admin-service.lambda_function_invoke_arn
}

resource "aws_api_gateway_integration_response" "get_admin_records" {
  rest_api_id = aws_api_gateway_integration.get_admin_records.rest_api_id
  resource_id = aws_api_gateway_integration.get_admin_records.resource_id
  http_method = aws_api_gateway_integration.get_admin_records.http_method
  status_code = aws_api_gateway_method_response.get_admin_records.status_code

  response_templates = {
    "application/json" = ""
  }

  depends_on = [aws_api_gateway_integration.get_admin_records]
}

resource "aws_api_gateway_integration" "delete_admin_records_post_id" {
  rest_api_id             = aws_api_gateway_rest_api.vinyl-lk.id
  resource_id             = aws_api_gateway_resource.admin_records_post_id.id
  http_method             = aws_api_gateway_method.delete_admin_records_post_id.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = module.lambda-admin-service.lambda_function_invoke_arn
}

resource "aws_api_gateway_integration_response" "delete_admin_records_post_id" {
  rest_api_id = aws_api_gateway_integration.delete_admin_records_post_id.rest_api_id
  resource_id = aws_api_gateway_integration.delete_admin_records_post_id.resource_id
  http_method = aws_api_gateway_integration.delete_admin_records_post_id.http_method
  status_code = aws_api_gateway_method_response.delete_admin_records_post_id.status_code

  response_templates = {
    "application/json" = ""
  }

  depends_on = [aws_api_gateway_integration.delete_admin_records_post_id]
}

# 
# Permissions
# 
resource "aws_lambda_permission" "get-admin" {
  statement_id  = "api-allow-admin-${terraform.workspace}"
  action        = "lambda:InvokeFunction"
  function_name = module.lambda-admin-service.lambda_function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.vinyl-lk.execution_arn}/*"
}
