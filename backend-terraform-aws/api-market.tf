

#
# API Function /market
#
resource "aws_api_gateway_resource" "market" {
  path_part   = "market"
  parent_id   = aws_api_gateway_rest_api.vinyl-lk.root_resource_id
  rest_api_id = aws_api_gateway_rest_api.vinyl-lk.id
}

# GET
resource "aws_api_gateway_method" "get_market" {
  rest_api_id   = aws_api_gateway_resource.market.rest_api_id
  resource_id   = aws_api_gateway_resource.market.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_method_response" "get_market" {
  rest_api_id = aws_api_gateway_method.get_market.rest_api_id
  resource_id = aws_api_gateway_method.get_market.resource_id
  http_method = aws_api_gateway_method.get_market.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }

  response_models = {
    "application/json" = "Empty"
  }
}

# POST
resource "aws_api_gateway_method" "post_market" {
  rest_api_id   = aws_api_gateway_resource.market.rest_api_id
  resource_id   = aws_api_gateway_resource.market.id
  http_method   = "POST"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.vinyl-lk-authorizer.id
}

resource "aws_api_gateway_method_response" "post_market" {
  rest_api_id = aws_api_gateway_method.post_market.rest_api_id
  resource_id = aws_api_gateway_method.post_market.resource_id
  http_method = aws_api_gateway_method.post_market.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }

  response_models = {
    "application/json" = "Empty"
  }
}

#
# API Function /market/search
#
resource "aws_api_gateway_resource" "market_search" {
  path_part   = "search"
  parent_id   = aws_api_gateway_resource.market.id
  rest_api_id = aws_api_gateway_rest_api.vinyl-lk.id
}

# GET
resource "aws_api_gateway_method" "get_market_search" {
  rest_api_id   = aws_api_gateway_resource.market_search.rest_api_id
  resource_id   = aws_api_gateway_resource.market_search.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_method_response" "get_market_search" {
  rest_api_id = aws_api_gateway_method.get_market_search.rest_api_id
  resource_id = aws_api_gateway_method.get_market_search.resource_id
  http_method = aws_api_gateway_method.get_market_search.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }

  response_models = {
    "application/json" = "Empty"
  }
}

#
# API Function /market/{postId}
#
resource "aws_api_gateway_resource" "market_id" {
  path_part   = "{postId}"
  parent_id   = aws_api_gateway_resource.market.id
  rest_api_id = aws_api_gateway_rest_api.vinyl-lk.id
}

# GET
resource "aws_api_gateway_method" "get_market_id" {
  rest_api_id   = aws_api_gateway_resource.market_id.rest_api_id
  resource_id   = aws_api_gateway_resource.market_id.id
  http_method   = "GET"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.vinyl-lk-authorizer.id

  request_parameters = {
    "method.request.path.postId" = true
  }
}

resource "aws_api_gateway_method_response" "get_market_id" {
  rest_api_id = aws_api_gateway_method.get_market_id.rest_api_id
  resource_id = aws_api_gateway_method.get_market_id.resource_id
  http_method = aws_api_gateway_method.get_market_id.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }

  response_models = {
    "application/json" = "Empty"
  }
}

# POST
resource "aws_api_gateway_method" "post_market_id" {
  rest_api_id   = aws_api_gateway_resource.market_id.rest_api_id
  resource_id   = aws_api_gateway_resource.market_id.id
  http_method   = "POST"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.vinyl-lk-authorizer.id

  request_parameters = {
    "method.request.path.postId" = true
  }
}

resource "aws_api_gateway_method_response" "post_market_id" {
  rest_api_id = aws_api_gateway_method.post_market_id.rest_api_id
  resource_id = aws_api_gateway_method.post_market_id.resource_id
  http_method = aws_api_gateway_method.post_market_id.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }

  response_models = {
    "application/json" = "Empty"
  }
}

# DELETE
resource "aws_api_gateway_method" "delete_market_id" {
  rest_api_id   = aws_api_gateway_resource.market_id.rest_api_id
  resource_id   = aws_api_gateway_resource.market_id.id
  http_method   = "DELETE"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.vinyl-lk-authorizer.id

  request_parameters = {
    "method.request.path.postId" = true
  }
}

resource "aws_api_gateway_method_response" "delete_market_id" {
  rest_api_id = aws_api_gateway_method.delete_market_id.rest_api_id
  resource_id = aws_api_gateway_method.delete_market_id.resource_id
  http_method = aws_api_gateway_method.delete_market_id.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }

  response_models = {
    "application/json" = "Empty"
  }
}

#
# API Function /market/{postId}/report
#
resource "aws_api_gateway_resource" "market_id_report" {
  path_part   = "report"
  parent_id   = aws_api_gateway_resource.market_id.id
  rest_api_id = aws_api_gateway_rest_api.vinyl-lk.id
}

# GET
resource "aws_api_gateway_method" "get_market_id_report" {
  rest_api_id   = aws_api_gateway_resource.market_id_report.rest_api_id
  resource_id   = aws_api_gateway_resource.market_id_report.id
  http_method   = "GET"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.vinyl-lk-authorizer.id

  request_parameters = {
    "method.request.path.postId" = true
  }
}

resource "aws_api_gateway_method_response" "get_market_id_report" {
  rest_api_id = aws_api_gateway_method.get_market_id_report.rest_api_id
  resource_id = aws_api_gateway_method.get_market_id_report.resource_id
  http_method = aws_api_gateway_method.get_market_id_report.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }

  response_models = {
    "application/json" = "Empty"
  }
}

# POST
resource "aws_api_gateway_method" "post_market_id_report" {
  rest_api_id   = aws_api_gateway_resource.market_id_report.rest_api_id
  resource_id   = aws_api_gateway_resource.market_id_report.id
  http_method   = "POST"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.vinyl-lk-authorizer.id

  request_parameters = {
    "method.request.path.postId" = true
  }
}

resource "aws_api_gateway_method_response" "post_market_id_report" {
  rest_api_id = aws_api_gateway_method.post_market_id_report.rest_api_id
  resource_id = aws_api_gateway_method.post_market_id_report.resource_id
  http_method = aws_api_gateway_method.post_market_id_report.http_method
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
module "cors-market" {
  source  = "squidfunk/api-gateway-enable-cors/aws"
  version = "0.3.3"

  api_id          = aws_api_gateway_rest_api.vinyl-lk.id
  api_resource_id = aws_api_gateway_resource.market.id
}

module "cors-market_id" {
  source  = "squidfunk/api-gateway-enable-cors/aws"
  version = "0.3.3"

  api_id          = aws_api_gateway_rest_api.vinyl-lk.id
  api_resource_id = aws_api_gateway_resource.market_id.id
}

module "cors-market_search" {
  source  = "squidfunk/api-gateway-enable-cors/aws"
  version = "0.3.3"

  api_id          = aws_api_gateway_rest_api.vinyl-lk.id
  api_resource_id = aws_api_gateway_resource.market_search.id
}

module "cors-market_id_report" {
  source  = "squidfunk/api-gateway-enable-cors/aws"
  version = "0.3.3"

  api_id          = aws_api_gateway_rest_api.vinyl-lk.id
  api_resource_id = aws_api_gateway_resource.market_id_report.id
}

# 
# Integrations
# 
resource "aws_api_gateway_integration" "get_market" {
  rest_api_id             = aws_api_gateway_rest_api.vinyl-lk.id
  resource_id             = aws_api_gateway_resource.market.id
  http_method             = aws_api_gateway_method.get_market.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = module.lambda-market-service.lambda_function_invoke_arn
}

resource "aws_api_gateway_integration_response" "get_market" {
  rest_api_id = aws_api_gateway_integration.get_market.rest_api_id
  resource_id = aws_api_gateway_integration.get_market.resource_id
  http_method = aws_api_gateway_integration.get_market.http_method
  status_code = aws_api_gateway_method_response.get_market.status_code

  response_templates = {
    "application/json" = ""
  }

  depends_on = [aws_api_gateway_integration.get_market]
}

resource "aws_api_gateway_integration" "post_market" {
  rest_api_id             = aws_api_gateway_rest_api.vinyl-lk.id
  resource_id             = aws_api_gateway_resource.market.id
  http_method             = aws_api_gateway_method.post_market.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = module.lambda-market-service.lambda_function_invoke_arn
}

resource "aws_api_gateway_integration_response" "post_market" {
  rest_api_id = aws_api_gateway_integration.post_market.rest_api_id
  resource_id = aws_api_gateway_integration.post_market.resource_id
  http_method = aws_api_gateway_integration.post_market.http_method
  status_code = aws_api_gateway_method_response.post_market.status_code

  response_templates = {
    "application/json" = ""
  }

  depends_on = [aws_api_gateway_integration.post_market]
}

resource "aws_api_gateway_integration" "get_market_search" {
  rest_api_id             = aws_api_gateway_rest_api.vinyl-lk.id
  resource_id             = aws_api_gateway_resource.market_search.id
  http_method             = aws_api_gateway_method.get_market_search.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = module.lambda-market-service.lambda_function_invoke_arn
}

resource "aws_api_gateway_integration_response" "get_market_search" {
  rest_api_id = aws_api_gateway_integration.get_market_search.rest_api_id
  resource_id = aws_api_gateway_integration.get_market_search.resource_id
  http_method = aws_api_gateway_integration.get_market_search.http_method
  status_code = aws_api_gateway_method_response.get_market_search.status_code

  response_templates = {
    "application/json" = ""
  }

  depends_on = [aws_api_gateway_integration.get_market_search]
}

resource "aws_api_gateway_integration" "get_market_id" {
  rest_api_id             = aws_api_gateway_rest_api.vinyl-lk.id
  resource_id             = aws_api_gateway_resource.market_id.id
  http_method             = aws_api_gateway_method.get_market_id.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = module.lambda-market-service.lambda_function_invoke_arn
}

resource "aws_api_gateway_integration_response" "get_market_id" {
  rest_api_id = aws_api_gateway_integration.get_market_id.rest_api_id
  resource_id = aws_api_gateway_integration.get_market_id.resource_id
  http_method = aws_api_gateway_integration.get_market_id.http_method
  status_code = aws_api_gateway_method_response.get_market_id.status_code

  response_templates = {
    "application/json" = ""
  }

  depends_on = [aws_api_gateway_integration.get_market_id]
}

resource "aws_api_gateway_integration" "post_market_id" {
  rest_api_id             = aws_api_gateway_rest_api.vinyl-lk.id
  resource_id             = aws_api_gateway_resource.market_id.id
  http_method             = aws_api_gateway_method.post_market_id.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = module.lambda-market-service.lambda_function_invoke_arn
}

resource "aws_api_gateway_integration_response" "post_market_id" {
  rest_api_id = aws_api_gateway_integration.post_market_id.rest_api_id
  resource_id = aws_api_gateway_integration.post_market_id.resource_id
  http_method = aws_api_gateway_integration.post_market_id.http_method
  status_code = aws_api_gateway_method_response.post_market_id.status_code

  response_templates = {
    "application/json" = ""
  }

  depends_on = [aws_api_gateway_integration.post_market_id]
}

resource "aws_api_gateway_integration" "delete_market_id" {
  rest_api_id             = aws_api_gateway_rest_api.vinyl-lk.id
  resource_id             = aws_api_gateway_resource.market_id.id
  http_method             = aws_api_gateway_method.delete_market_id.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = module.lambda-market-service.lambda_function_invoke_arn
}

resource "aws_api_gateway_integration_response" "delete_market_id" {
  rest_api_id = aws_api_gateway_integration.delete_market_id.rest_api_id
  resource_id = aws_api_gateway_integration.delete_market_id.resource_id
  http_method = aws_api_gateway_integration.delete_market_id.http_method
  status_code = aws_api_gateway_method_response.delete_market_id.status_code

  response_templates = {
    "application/json" = ""
  }

  depends_on = [aws_api_gateway_integration.delete_market_id]
}

resource "aws_api_gateway_integration" "get_market_id_report" {
  rest_api_id             = aws_api_gateway_rest_api.vinyl-lk.id
  resource_id             = aws_api_gateway_resource.market_id_report.id
  http_method             = aws_api_gateway_method.get_market_id_report.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = module.lambda-market-service.lambda_function_invoke_arn
}

resource "aws_api_gateway_integration_response" "get_market_id_report" {
  rest_api_id = aws_api_gateway_integration.get_market_id_report.rest_api_id
  resource_id = aws_api_gateway_integration.get_market_id_report.resource_id
  http_method = aws_api_gateway_integration.get_market_id_report.http_method
  status_code = aws_api_gateway_method_response.get_market_id_report.status_code

  response_templates = {
    "application/json" = ""
  }

  depends_on = [aws_api_gateway_integration.get_market_id_report]
}

resource "aws_api_gateway_integration" "post_market_id_report" {
  rest_api_id             = aws_api_gateway_rest_api.vinyl-lk.id
  resource_id             = aws_api_gateway_resource.market_id_report.id
  http_method             = aws_api_gateway_method.post_market_id_report.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = module.lambda-market-service.lambda_function_invoke_arn
}

resource "aws_api_gateway_integration_response" "post_market_id_report" {
  rest_api_id = aws_api_gateway_integration.post_market_id_report.rest_api_id
  resource_id = aws_api_gateway_integration.post_market_id_report.resource_id
  http_method = aws_api_gateway_integration.post_market_id_report.http_method
  status_code = aws_api_gateway_method_response.post_market_id_report.status_code

  response_templates = {
    "application/json" = ""
  }

  depends_on = [aws_api_gateway_integration.get_market_id_report]
}

# 
# Permissions
# 
resource "aws_lambda_permission" "get-market" {
  statement_id  = "api-allow-market-${terraform.workspace}"
  action        = "lambda:InvokeFunction"
  function_name = module.lambda-market-service.lambda_function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.vinyl-lk.execution_arn}/*"
}
