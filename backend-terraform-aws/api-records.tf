#
# API Function /records
#
resource "aws_api_gateway_resource" "records" {
  path_part   = "records"
  parent_id   = aws_api_gateway_rest_api.vinyl-lk.root_resource_id
  rest_api_id = aws_api_gateway_rest_api.vinyl-lk.id
}

# GET
resource "aws_api_gateway_method" "get_records" {
  rest_api_id   = aws_api_gateway_resource.records.rest_api_id
  resource_id   = aws_api_gateway_resource.records.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_method_response" "get_records" {
  rest_api_id = aws_api_gateway_method.get_records.rest_api_id
  resource_id = aws_api_gateway_method.get_records.resource_id
  http_method = aws_api_gateway_method.get_records.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }

  response_models = {
    "application/json" = "Empty"
  }
}

# POST
resource "aws_api_gateway_method" "post_records" {
  rest_api_id   = aws_api_gateway_resource.records.rest_api_id
  resource_id   = aws_api_gateway_resource.records.id
  http_method   = "POST"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.vinyl-lk-authorizer.id
}

resource "aws_api_gateway_method_response" "post_records" {
  rest_api_id = aws_api_gateway_method.post_records.rest_api_id
  resource_id = aws_api_gateway_method.post_records.resource_id
  http_method = aws_api_gateway_method.post_records.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }

  response_models = {
    "application/json" = "Empty"
  }
}

#
# API Function /records/search
#
resource "aws_api_gateway_resource" "records_search" {
  path_part   = "search"
  parent_id   = aws_api_gateway_resource.records.id
  rest_api_id = aws_api_gateway_rest_api.vinyl-lk.id
}

# GET
resource "aws_api_gateway_method" "get_records_search" {
  rest_api_id   = aws_api_gateway_resource.records_search.rest_api_id
  resource_id   = aws_api_gateway_resource.records_search.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_method_response" "get_records_search" {
  rest_api_id = aws_api_gateway_method.get_records_search.rest_api_id
  resource_id = aws_api_gateway_method.get_records_search.resource_id
  http_method = aws_api_gateway_method.get_records_search.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }

  response_models = {
    "application/json" = "Empty"
  }
}

#
# API Function /records/{recordId}
#
resource "aws_api_gateway_resource" "records_id" {
  path_part   = "{recordId}"
  parent_id   = aws_api_gateway_resource.records.id
  rest_api_id = aws_api_gateway_rest_api.vinyl-lk.id
}

# GET
resource "aws_api_gateway_method" "get_records_id" {
  rest_api_id   = aws_api_gateway_resource.records_id.rest_api_id
  resource_id   = aws_api_gateway_resource.records_id.id
  http_method   = "GET"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.vinyl-lk-authorizer.id

  request_parameters = {
    "method.request.path.recordId" = true
  }
}

resource "aws_api_gateway_method_response" "get_records_id" {
  rest_api_id = aws_api_gateway_method.get_records_id.rest_api_id
  resource_id = aws_api_gateway_method.get_records_id.resource_id
  http_method = aws_api_gateway_method.get_records_id.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }

  response_models = {
    "application/json" = "Empty"
  }
}

# POST
resource "aws_api_gateway_method" "post_records_id" {
  rest_api_id   = aws_api_gateway_resource.records_id.rest_api_id
  resource_id   = aws_api_gateway_resource.records_id.id
  http_method   = "POST"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.vinyl-lk-authorizer.id

  request_parameters = {
    "method.request.path.recordId" = true
  }
}

resource "aws_api_gateway_method_response" "post_records_id" {
  rest_api_id = aws_api_gateway_method.post_records_id.rest_api_id
  resource_id = aws_api_gateway_method.post_records_id.resource_id
  http_method = aws_api_gateway_method.post_records_id.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }

  response_models = {
    "application/json" = "Empty"
  }
}

#
# API Function /records/{recordId}/revisions
#
resource "aws_api_gateway_resource" "records_id_revisions" {
  path_part   = "revisions"
  parent_id   = aws_api_gateway_resource.records_id.id
  rest_api_id = aws_api_gateway_rest_api.vinyl-lk.id
}

# GET
resource "aws_api_gateway_method" "get_records_id_revisions" {
  rest_api_id   = aws_api_gateway_resource.records_id_revisions.rest_api_id
  resource_id   = aws_api_gateway_resource.records_id_revisions.id
  http_method   = "GET"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.vinyl-lk-authorizer.id

  request_parameters = {
    "method.request.path.recordId" = true
  }
}

resource "aws_api_gateway_method_response" "get_records_id_revisions" {
  rest_api_id = aws_api_gateway_method.get_records_id_revisions.rest_api_id
  resource_id = aws_api_gateway_method.get_records_id_revisions.resource_id
  http_method = aws_api_gateway_method.get_records_id_revisions.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }

  response_models = {
    "application/json" = "Empty"
  }
}

#
# API Function /records/{recordId}/revisions/{revisionId}
#
resource "aws_api_gateway_resource" "records_id_revisions_id" {
  path_part   = "{revisionId}"
  parent_id   = aws_api_gateway_resource.records_id_revisions.id
  rest_api_id = aws_api_gateway_rest_api.vinyl-lk.id
}

# GET
resource "aws_api_gateway_method" "get_records_id_revisions_id" {
  rest_api_id   = aws_api_gateway_resource.records_id_revisions_id.rest_api_id
  resource_id   = aws_api_gateway_resource.records_id_revisions_id.id
  http_method   = "GET"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.vinyl-lk-authorizer.id

  request_parameters = {
    "method.request.path.recordId"   = true
    "method.request.path.revisionId" = true
  }
}

resource "aws_api_gateway_method_response" "get_records_id_revisions_id" {
  rest_api_id = aws_api_gateway_method.get_records_id_revisions_id.rest_api_id
  resource_id = aws_api_gateway_method.get_records_id_revisions_id.resource_id
  http_method = aws_api_gateway_method.get_records_id_revisions_id.http_method
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
module "cors-records" {
  source  = "squidfunk/api-gateway-enable-cors/aws"
  version = "0.3.3"

  api_id          = aws_api_gateway_rest_api.vinyl-lk.id
  api_resource_id = aws_api_gateway_resource.records.id
}

module "cors-records_id" {
  source  = "squidfunk/api-gateway-enable-cors/aws"
  version = "0.3.3"

  api_id          = aws_api_gateway_rest_api.vinyl-lk.id
  api_resource_id = aws_api_gateway_resource.records_id.id
}

module "cors-records_search" {
  source  = "squidfunk/api-gateway-enable-cors/aws"
  version = "0.3.3"

  api_id          = aws_api_gateway_rest_api.vinyl-lk.id
  api_resource_id = aws_api_gateway_resource.records_search.id
}

module "cors-records_id_revisions" {
  source  = "squidfunk/api-gateway-enable-cors/aws"
  version = "0.3.3"

  api_id          = aws_api_gateway_rest_api.vinyl-lk.id
  api_resource_id = aws_api_gateway_resource.records_id_revisions.id
}

module "cors-records_id_revisions_id" {
  source  = "squidfunk/api-gateway-enable-cors/aws"
  version = "0.3.3"

  api_id          = aws_api_gateway_rest_api.vinyl-lk.id
  api_resource_id = aws_api_gateway_resource.records_id_revisions_id.id
}

# 
# Integrations
# 
resource "aws_api_gateway_integration" "get_records" {
  rest_api_id             = aws_api_gateway_rest_api.vinyl-lk.id
  resource_id             = aws_api_gateway_resource.records.id
  http_method             = aws_api_gateway_method.get_records.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = module.lambda-records-service.lambda_function_invoke_arn
}

resource "aws_api_gateway_integration_response" "get_records" {
  rest_api_id = aws_api_gateway_integration.get_records.rest_api_id
  resource_id = aws_api_gateway_integration.get_records.resource_id
  http_method = aws_api_gateway_integration.get_records.http_method
  status_code = aws_api_gateway_method_response.get_records.status_code

  response_templates = {
    "application/json" = ""
  }

  depends_on = [aws_api_gateway_integration.get_records]
}

resource "aws_api_gateway_integration" "post_records" {
  rest_api_id             = aws_api_gateway_rest_api.vinyl-lk.id
  resource_id             = aws_api_gateway_resource.records.id
  http_method             = aws_api_gateway_method.post_records.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = module.lambda-records-service.lambda_function_invoke_arn
}

resource "aws_api_gateway_integration_response" "post_records" {
  rest_api_id = aws_api_gateway_integration.post_records.rest_api_id
  resource_id = aws_api_gateway_integration.post_records.resource_id
  http_method = aws_api_gateway_integration.post_records.http_method
  status_code = aws_api_gateway_method_response.post_records.status_code

  response_templates = {
    "application/json" = ""
  }

  depends_on = [aws_api_gateway_integration.post_records]
}

resource "aws_api_gateway_integration" "get_records_id" {
  rest_api_id             = aws_api_gateway_rest_api.vinyl-lk.id
  resource_id             = aws_api_gateway_resource.records_id.id
  http_method             = aws_api_gateway_method.get_records_id.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = module.lambda-records-service.lambda_function_invoke_arn
}

resource "aws_api_gateway_integration_response" "get_records_id" {
  rest_api_id = aws_api_gateway_integration.get_records_id.rest_api_id
  resource_id = aws_api_gateway_integration.get_records_id.resource_id
  http_method = aws_api_gateway_integration.get_records_id.http_method
  status_code = aws_api_gateway_method_response.get_records_id.status_code

  response_templates = {
    "application/json" = ""
  }

  depends_on = [aws_api_gateway_integration.get_records_id]
}

resource "aws_api_gateway_integration" "post_records_id" {
  rest_api_id             = aws_api_gateway_rest_api.vinyl-lk.id
  resource_id             = aws_api_gateway_resource.records_id.id
  http_method             = aws_api_gateway_method.post_records_id.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = module.lambda-records-service.lambda_function_invoke_arn
}

resource "aws_api_gateway_integration_response" "post_records_id" {
  rest_api_id = aws_api_gateway_integration.post_records_id.rest_api_id
  resource_id = aws_api_gateway_integration.post_records_id.resource_id
  http_method = aws_api_gateway_integration.post_records_id.http_method
  status_code = aws_api_gateway_method_response.post_records_id.status_code

  response_templates = {
    "application/json" = ""
  }

  depends_on = [aws_api_gateway_integration.post_records_id]
}

resource "aws_api_gateway_integration" "get_records_id_revisions" {
  rest_api_id             = aws_api_gateway_rest_api.vinyl-lk.id
  resource_id             = aws_api_gateway_resource.records_id_revisions.id
  http_method             = aws_api_gateway_method.get_records_id_revisions.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = module.lambda-records-service.lambda_function_invoke_arn
}

resource "aws_api_gateway_integration_response" "get_records_id_revisions" {
  rest_api_id = aws_api_gateway_integration.get_records_id_revisions.rest_api_id
  resource_id = aws_api_gateway_integration.get_records_id_revisions.resource_id
  http_method = aws_api_gateway_integration.get_records_id_revisions.http_method
  status_code = aws_api_gateway_method_response.get_records_id_revisions.status_code

  response_templates = {
    "application/json" = ""
  }

  depends_on = [aws_api_gateway_integration.get_records_id_revisions]
}

resource "aws_api_gateway_integration" "get_records_id_revisions_id" {
  rest_api_id             = aws_api_gateway_rest_api.vinyl-lk.id
  resource_id             = aws_api_gateway_resource.records_id_revisions_id.id
  http_method             = aws_api_gateway_method.get_records_id_revisions_id.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = module.lambda-records-service.lambda_function_invoke_arn
}

resource "aws_api_gateway_integration_response" "get_records_id_revisions_id" {
  rest_api_id = aws_api_gateway_integration.get_records_id_revisions_id.rest_api_id
  resource_id = aws_api_gateway_integration.get_records_id_revisions_id.resource_id
  http_method = aws_api_gateway_integration.get_records_id_revisions_id.http_method
  status_code = aws_api_gateway_method_response.get_records_id_revisions_id.status_code

  response_templates = {
    "application/json" = ""
  }

  depends_on = [aws_api_gateway_integration.get_records_id_revisions_id]
}

resource "aws_api_gateway_integration" "get_records_search" {
  rest_api_id             = aws_api_gateway_rest_api.vinyl-lk.id
  resource_id             = aws_api_gateway_resource.records_search.id
  http_method             = aws_api_gateway_method.get_records_search.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = module.lambda-records-service.lambda_function_invoke_arn
}

resource "aws_api_gateway_integration_response" "get_records_search" {
  rest_api_id = aws_api_gateway_integration.get_records_search.rest_api_id
  resource_id = aws_api_gateway_integration.get_records_search.resource_id
  http_method = aws_api_gateway_integration.get_records_search.http_method
  status_code = aws_api_gateway_method_response.get_records_search.status_code

  response_templates = {
    "application/json" = ""
  }

  depends_on = [aws_api_gateway_integration.get_records_search]
}

# 
# Permissions
# 
resource "aws_lambda_permission" "get-records" {
  statement_id  = "api-allow-records-${terraform.workspace}"
  action        = "lambda:InvokeFunction"
  function_name = module.lambda-records-service.lambda_function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.vinyl-lk.execution_arn}/*"
}
