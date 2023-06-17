
#
# API Function /forum
#
resource "aws_api_gateway_resource" "forum" {
  path_part   = "forum"
  parent_id   = aws_api_gateway_rest_api.vinyl-lk.root_resource_id
  rest_api_id = aws_api_gateway_rest_api.vinyl-lk.id
}

# GET
resource "aws_api_gateway_method" "get_forum" {
  rest_api_id   = aws_api_gateway_resource.forum.rest_api_id
  resource_id   = aws_api_gateway_resource.forum.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_method_response" "get_forum" {
  rest_api_id = aws_api_gateway_method.get_forum.rest_api_id
  resource_id = aws_api_gateway_method.get_forum.resource_id
  http_method = aws_api_gateway_method.get_forum.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }

  response_models = {
    "application/json" = "Empty"
  }
}

# POST
resource "aws_api_gateway_method" "post_forum" {
  rest_api_id   = aws_api_gateway_resource.forum.rest_api_id
  resource_id   = aws_api_gateway_resource.forum.id
  http_method   = "POST"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.vinyl-lk-authorizer.id
}

resource "aws_api_gateway_method_response" "post_forum" {
  rest_api_id = aws_api_gateway_method.post_forum.rest_api_id
  resource_id = aws_api_gateway_method.post_forum.resource_id
  http_method = aws_api_gateway_method.post_forum.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }

  response_models = {
    "application/json" = "Empty"
  }
}

#
# API Function /forum/search
#
resource "aws_api_gateway_resource" "forum_search" {
  path_part   = "search"
  parent_id   = aws_api_gateway_resource.forum.id
  rest_api_id = aws_api_gateway_rest_api.vinyl-lk.id
}

# GET
resource "aws_api_gateway_method" "get_forum_search" {
  rest_api_id   = aws_api_gateway_resource.forum_search.rest_api_id
  resource_id   = aws_api_gateway_resource.forum_search.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_method_response" "get_forum_search" {
  rest_api_id = aws_api_gateway_method.get_forum_search.rest_api_id
  resource_id = aws_api_gateway_method.get_forum_search.resource_id
  http_method = aws_api_gateway_method.get_forum_search.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }

  response_models = {
    "application/json" = "Empty"
  }
}

#
# API Function /forum/{postId}
#
resource "aws_api_gateway_resource" "forum_id" {
  path_part   = "{postId}"
  parent_id   = aws_api_gateway_resource.forum.id
  rest_api_id = aws_api_gateway_rest_api.vinyl-lk.id
}

# GET
resource "aws_api_gateway_method" "get_forum_id" {
  rest_api_id   = aws_api_gateway_resource.forum_id.rest_api_id
  resource_id   = aws_api_gateway_resource.forum_id.id
  http_method   = "GET"
  authorization = "NONE"

  request_parameters = {
    "method.request.path.postId" = true
  }
}

resource "aws_api_gateway_method_response" "get_forum_id" {
  rest_api_id = aws_api_gateway_method.get_forum_id.rest_api_id
  resource_id = aws_api_gateway_method.get_forum_id.resource_id
  http_method = aws_api_gateway_method.get_forum_id.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }

  response_models = {
    "application/json" = "Empty"
  }
}

# POST
resource "aws_api_gateway_method" "post_forum_id" {
  rest_api_id   = aws_api_gateway_resource.forum_id.rest_api_id
  resource_id   = aws_api_gateway_resource.forum_id.id
  http_method   = "POST"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.vinyl-lk-authorizer.id

  request_parameters = {
    "method.request.path.postId" = true
  }
}

resource "aws_api_gateway_method_response" "post_forum_id" {
  rest_api_id = aws_api_gateway_method.post_forum_id.rest_api_id
  resource_id = aws_api_gateway_method.post_forum_id.resource_id
  http_method = aws_api_gateway_method.post_forum_id.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }

  response_models = {
    "application/json" = "Empty"
  }
}

# DELETE
resource "aws_api_gateway_method" "delete_forum_id" {
  rest_api_id   = aws_api_gateway_resource.forum_id.rest_api_id
  resource_id   = aws_api_gateway_resource.forum_id.id
  http_method   = "DELETE"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.vinyl-lk-authorizer.id

  request_parameters = {
    "method.request.path.postId" = true
  }
}

resource "aws_api_gateway_method_response" "delete_forum_id" {
  rest_api_id = aws_api_gateway_method.delete_forum_id.rest_api_id
  resource_id = aws_api_gateway_method.delete_forum_id.resource_id
  http_method = aws_api_gateway_method.delete_forum_id.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }

  response_models = {
    "application/json" = "Empty"
  }
}

#
# API Function /forum/{postId}/comments
#
resource "aws_api_gateway_resource" "forum_id_comments" {
  path_part   = "comments"
  parent_id   = aws_api_gateway_resource.forum_id.id
  rest_api_id = aws_api_gateway_rest_api.vinyl-lk.id
}

# GET
resource "aws_api_gateway_method" "get_forum_id_comments" {
  rest_api_id   = aws_api_gateway_resource.forum_id_comments.rest_api_id
  resource_id   = aws_api_gateway_resource.forum_id_comments.id
  http_method   = "GET"
  authorization = "NONE"

  request_parameters = {
    "method.request.path.postId" = true
  }
}

resource "aws_api_gateway_method_response" "get_forum_id_comments" {
  rest_api_id = aws_api_gateway_method.get_forum_id_comments.rest_api_id
  resource_id = aws_api_gateway_method.get_forum_id_comments.resource_id
  http_method = aws_api_gateway_method.get_forum_id_comments.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }

  response_models = {
    "application/json" = "Empty"
  }
}

# POST
resource "aws_api_gateway_method" "post_forum_id_comments" {
  rest_api_id   = aws_api_gateway_resource.forum_id_comments.rest_api_id
  resource_id   = aws_api_gateway_resource.forum_id_comments.id
  http_method   = "POST"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.vinyl-lk-authorizer.id

  request_parameters = {
    "method.request.path.postId" = true
  }
}

resource "aws_api_gateway_method_response" "post_forum_id_comments" {
  rest_api_id = aws_api_gateway_method.post_forum_id_comments.rest_api_id
  resource_id = aws_api_gateway_method.post_forum_id_comments.resource_id
  http_method = aws_api_gateway_method.post_forum_id_comments.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }

  response_models = {
    "application/json" = "Empty"
  }
}

#
# API Function /forum/{postId}/comments/{commentId}
#
resource "aws_api_gateway_resource" "forum_id_comments_id" {
  path_part   = "{commentId}"
  parent_id   = aws_api_gateway_resource.forum_id_comments.id
  rest_api_id = aws_api_gateway_rest_api.vinyl-lk.id
}

# GET
resource "aws_api_gateway_method" "get_forum_id_comments_id" {
  rest_api_id   = aws_api_gateway_resource.forum_id_comments_id.rest_api_id
  resource_id   = aws_api_gateway_resource.forum_id_comments_id.id
  http_method   = "GET"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.vinyl-lk-authorizer.id

  request_parameters = {
    "method.request.path.postId"    = true
    "method.request.path.commentId" = true
  }
}

resource "aws_api_gateway_method_response" "get_forum_id_comments_id" {
  rest_api_id = aws_api_gateway_method.get_forum_id_comments_id.rest_api_id
  resource_id = aws_api_gateway_method.get_forum_id_comments_id.resource_id
  http_method = aws_api_gateway_method.get_forum_id_comments_id.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }

  response_models = {
    "application/json" = "Empty"
  }
}

# DELETE
resource "aws_api_gateway_method" "delete_forum_id_comments_id" {
  rest_api_id   = aws_api_gateway_resource.forum_id_comments_id.rest_api_id
  resource_id   = aws_api_gateway_resource.forum_id_comments_id.id
  http_method   = "DELETE"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.vinyl-lk-authorizer.id

  request_parameters = {
    "method.request.path.postId"    = true
    "method.request.path.commentId" = true
  }
}

resource "aws_api_gateway_method_response" "delete_forum_id_comments_id" {
  rest_api_id = aws_api_gateway_method.delete_forum_id_comments_id.rest_api_id
  resource_id = aws_api_gateway_method.delete_forum_id_comments_id.resource_id
  http_method = aws_api_gateway_method.delete_forum_id_comments_id.http_method
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

module "cors-forum_id" {
  source  = "squidfunk/api-gateway-enable-cors/aws"
  version = "0.3.3"

  api_id          = aws_api_gateway_rest_api.vinyl-lk.id
  api_resource_id = aws_api_gateway_resource.forum_id.id
}

module "cors-forum_search" {
  source  = "squidfunk/api-gateway-enable-cors/aws"
  version = "0.3.3"

  api_id          = aws_api_gateway_rest_api.vinyl-lk.id
  api_resource_id = aws_api_gateway_resource.forum_search.id
}

module "cors-forum_id_comments" {
  source  = "squidfunk/api-gateway-enable-cors/aws"
  version = "0.3.3"

  api_id          = aws_api_gateway_rest_api.vinyl-lk.id
  api_resource_id = aws_api_gateway_resource.forum_id_comments.id
}

module "cors-forum_id_comments_id" {
  source  = "squidfunk/api-gateway-enable-cors/aws"
  version = "0.3.3"

  api_id          = aws_api_gateway_rest_api.vinyl-lk.id
  api_resource_id = aws_api_gateway_resource.forum_id_comments_id.id
}

# 
# Integrations
# 
resource "aws_api_gateway_integration" "get_forum" {
  rest_api_id             = aws_api_gateway_rest_api.vinyl-lk.id
  resource_id             = aws_api_gateway_resource.forum.id
  http_method             = aws_api_gateway_method.get_forum.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = module.lambda-forum-service.lambda_function_invoke_arn
}

resource "aws_api_gateway_integration_response" "get_forum" {
  rest_api_id = aws_api_gateway_integration.get_forum.rest_api_id
  resource_id = aws_api_gateway_integration.get_forum.resource_id
  http_method = aws_api_gateway_integration.get_forum.http_method
  status_code = aws_api_gateway_method_response.get_forum.status_code

  response_templates = {
    "application/json" = ""
  }

  depends_on = [aws_api_gateway_integration.get_forum]
}

resource "aws_api_gateway_integration" "post_forum" {
  rest_api_id             = aws_api_gateway_rest_api.vinyl-lk.id
  resource_id             = aws_api_gateway_resource.forum.id
  http_method             = aws_api_gateway_method.post_forum.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = module.lambda-forum-service.lambda_function_invoke_arn
}

resource "aws_api_gateway_integration_response" "post_forum" {
  rest_api_id = aws_api_gateway_integration.post_forum.rest_api_id
  resource_id = aws_api_gateway_integration.post_forum.resource_id
  http_method = aws_api_gateway_integration.post_forum.http_method
  status_code = aws_api_gateway_method_response.post_forum.status_code

  response_templates = {
    "application/json" = ""
  }

  depends_on = [aws_api_gateway_integration.post_forum]
}

resource "aws_api_gateway_integration" "get_forum_search" {
  rest_api_id             = aws_api_gateway_rest_api.vinyl-lk.id
  resource_id             = aws_api_gateway_resource.forum_search.id
  http_method             = aws_api_gateway_method.get_forum_search.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = module.lambda-forum-service.lambda_function_invoke_arn
}

resource "aws_api_gateway_integration_response" "get_forum_search" {
  rest_api_id = aws_api_gateway_integration.get_forum_search.rest_api_id
  resource_id = aws_api_gateway_integration.get_forum_search.resource_id
  http_method = aws_api_gateway_integration.get_forum_search.http_method
  status_code = aws_api_gateway_method_response.get_forum_search.status_code

  response_templates = {
    "application/json" = ""
  }

  depends_on = [aws_api_gateway_integration.get_forum_search]
}

resource "aws_api_gateway_integration" "get_forum_id" {
  rest_api_id             = aws_api_gateway_rest_api.vinyl-lk.id
  resource_id             = aws_api_gateway_resource.forum_id.id
  http_method             = aws_api_gateway_method.get_forum_id.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = module.lambda-forum-service.lambda_function_invoke_arn
}

resource "aws_api_gateway_integration_response" "get_forum_id" {
  rest_api_id = aws_api_gateway_integration.get_forum_id.rest_api_id
  resource_id = aws_api_gateway_integration.get_forum_id.resource_id
  http_method = aws_api_gateway_integration.get_forum_id.http_method
  status_code = aws_api_gateway_method_response.get_forum_id.status_code

  response_templates = {
    "application/json" = ""
  }

  depends_on = [aws_api_gateway_integration.get_forum_id]
}

resource "aws_api_gateway_integration" "post_forum_id" {
  rest_api_id             = aws_api_gateway_rest_api.vinyl-lk.id
  resource_id             = aws_api_gateway_resource.forum_id.id
  http_method             = aws_api_gateway_method.post_forum_id.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = module.lambda-forum-service.lambda_function_invoke_arn
}

resource "aws_api_gateway_integration_response" "post_forum_id" {
  rest_api_id = aws_api_gateway_integration.post_forum_id.rest_api_id
  resource_id = aws_api_gateway_integration.post_forum_id.resource_id
  http_method = aws_api_gateway_integration.post_forum_id.http_method
  status_code = aws_api_gateway_method_response.post_forum_id.status_code

  response_templates = {
    "application/json" = ""
  }

  depends_on = [aws_api_gateway_integration.post_forum_id]
}

resource "aws_api_gateway_integration" "delete_forum_id" {
  rest_api_id             = aws_api_gateway_rest_api.vinyl-lk.id
  resource_id             = aws_api_gateway_resource.forum_id.id
  http_method             = aws_api_gateway_method.delete_forum_id.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = module.lambda-forum-service.lambda_function_invoke_arn
}

resource "aws_api_gateway_integration_response" "delete_forum_id" {
  rest_api_id = aws_api_gateway_integration.delete_forum_id.rest_api_id
  resource_id = aws_api_gateway_integration.delete_forum_id.resource_id
  http_method = aws_api_gateway_integration.delete_forum_id.http_method
  status_code = aws_api_gateway_method_response.delete_forum_id.status_code

  response_templates = {
    "application/json" = ""
  }

  depends_on = [aws_api_gateway_integration.delete_forum_id]
}

resource "aws_api_gateway_integration" "get_forum_id_comments" {
  rest_api_id             = aws_api_gateway_rest_api.vinyl-lk.id
  resource_id             = aws_api_gateway_resource.forum_id_comments.id
  http_method             = aws_api_gateway_method.get_forum_id_comments.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = module.lambda-forum-service.lambda_function_invoke_arn
}

resource "aws_api_gateway_integration_response" "get_forum_id_comments" {
  rest_api_id = aws_api_gateway_integration.get_forum_id_comments.rest_api_id
  resource_id = aws_api_gateway_integration.get_forum_id_comments.resource_id
  http_method = aws_api_gateway_integration.get_forum_id_comments.http_method
  status_code = aws_api_gateway_method_response.get_forum_id_comments.status_code

  response_templates = {
    "application/json" = ""
  }

  depends_on = [aws_api_gateway_integration.get_forum_id_comments]
}

resource "aws_api_gateway_integration" "post_forum_id_comments" {
  rest_api_id             = aws_api_gateway_rest_api.vinyl-lk.id
  resource_id             = aws_api_gateway_resource.forum_id_comments.id
  http_method             = aws_api_gateway_method.post_forum_id_comments.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = module.lambda-forum-service.lambda_function_invoke_arn
}

resource "aws_api_gateway_integration_response" "post_forum_id_comments" {
  rest_api_id = aws_api_gateway_integration.post_forum_id_comments.rest_api_id
  resource_id = aws_api_gateway_integration.post_forum_id_comments.resource_id
  http_method = aws_api_gateway_integration.post_forum_id_comments.http_method
  status_code = aws_api_gateway_method_response.post_forum_id_comments.status_code

  response_templates = {
    "application/json" = ""
  }

  depends_on = [aws_api_gateway_integration.get_forum_id_comments]
}

resource "aws_api_gateway_integration" "get_forum_id_comments_id" {
  rest_api_id             = aws_api_gateway_rest_api.vinyl-lk.id
  resource_id             = aws_api_gateway_resource.forum_id_comments_id.id
  http_method             = aws_api_gateway_method.get_forum_id_comments_id.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = module.lambda-forum-service.lambda_function_invoke_arn
}

resource "aws_api_gateway_integration_response" "get_forum_id_comments_id" {
  rest_api_id = aws_api_gateway_integration.get_forum_id_comments_id.rest_api_id
  resource_id = aws_api_gateway_integration.get_forum_id_comments_id.resource_id
  http_method = aws_api_gateway_integration.get_forum_id_comments_id.http_method
  status_code = aws_api_gateway_method_response.get_forum_id_comments_id.status_code

  response_templates = {
    "application/json" = ""
  }

  depends_on = [aws_api_gateway_integration.get_forum_id_comments_id]
}

resource "aws_api_gateway_integration" "delete_forum_id_comments_id" {
  rest_api_id             = aws_api_gateway_rest_api.vinyl-lk.id
  resource_id             = aws_api_gateway_resource.forum_id_comments_id.id
  http_method             = aws_api_gateway_method.delete_forum_id_comments_id.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = module.lambda-forum-service.lambda_function_invoke_arn
}

resource "aws_api_gateway_integration_response" "delete_forum_id_comments_id" {
  rest_api_id = aws_api_gateway_integration.delete_forum_id_comments_id.rest_api_id
  resource_id = aws_api_gateway_integration.delete_forum_id_comments_id.resource_id
  http_method = aws_api_gateway_integration.delete_forum_id_comments_id.http_method
  status_code = aws_api_gateway_method_response.delete_forum_id_comments_id.status_code

  response_templates = {
    "application/json" = ""
  }

  depends_on = [aws_api_gateway_integration.delete_forum_id_comments_id]
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
