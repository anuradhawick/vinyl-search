#
# API Function /public/forum
#
resource "aws_api_gateway_resource" "public_forum" {
  path_part   = "forum"
  parent_id   = aws_api_gateway_resource.public.id
  rest_api_id = aws_api_gateway_rest_api.vinyl-lk.id
}

# ANY
resource "aws_api_gateway_method" "any_public_forum" {
  rest_api_id   = aws_api_gateway_resource.public_forum.rest_api_id
  resource_id   = aws_api_gateway_resource.public_forum.id
  http_method   = "ANY"
  authorization = "NONE"
}

resource "aws_api_gateway_method_response" "any_public_forum" {
  rest_api_id = aws_api_gateway_method.any_public_forum.rest_api_id
  resource_id = aws_api_gateway_method.any_public_forum.resource_id
  http_method = aws_api_gateway_method.any_public_forum.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }

  response_models = {
    "application/json" = "Empty"
  }
}

#
# API Function /public/forum/{proxy+}
#
resource "aws_api_gateway_resource" "public_forum_proxy" {
  path_part   = "{proxy+}"
  parent_id   = aws_api_gateway_resource.public_forum.id
  rest_api_id = aws_api_gateway_rest_api.vinyl-lk.id
}

# ANY
resource "aws_api_gateway_method" "any_public_forum_proxy" {
  rest_api_id   = aws_api_gateway_resource.public_forum_proxy.rest_api_id
  resource_id   = aws_api_gateway_resource.public_forum_proxy.id
  http_method   = "ANY"
  authorization = "NONE"

  request_parameters = {
    "method.request.path.proxy" = true
  }
}

resource "aws_api_gateway_method_response" "any_public_forum_proxy" {
  rest_api_id = aws_api_gateway_method.any_public_forum_proxy.rest_api_id
  resource_id = aws_api_gateway_method.any_public_forum_proxy.resource_id
  http_method = aws_api_gateway_method.any_public_forum_proxy.http_method
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
module "cors-public_forum" {
  source  = "squidfunk/api-gateway-enable-cors/aws"
  version = "0.3.3"

  api_id          = aws_api_gateway_rest_api.vinyl-lk.id
  api_resource_id = aws_api_gateway_resource.public_forum.id
}

module "cors-public_forum_proxy" {
  source  = "squidfunk/api-gateway-enable-cors/aws"
  version = "0.3.3"

  api_id          = aws_api_gateway_rest_api.vinyl-lk.id
  api_resource_id = aws_api_gateway_resource.public_forum_proxy.id
}

#
# Integrations
#
resource "aws_api_gateway_integration" "any_public_forum" {
  rest_api_id             = aws_api_gateway_rest_api.vinyl-lk.id
  resource_id             = aws_api_gateway_resource.public_forum.id
  http_method             = aws_api_gateway_method.any_public_forum.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = module.lambda-forum-service.lambda_function_invoke_arn
}

resource "aws_api_gateway_integration_response" "any_public_forum" {
  rest_api_id = aws_api_gateway_integration.any_public_forum.rest_api_id
  resource_id = aws_api_gateway_integration.any_public_forum.resource_id
  http_method = aws_api_gateway_integration.any_public_forum.http_method
  status_code = aws_api_gateway_method_response.any_public_forum.status_code

  response_templates = {
    "application/json" = ""
  }

  depends_on = [aws_api_gateway_integration.any_public_forum]
}

resource "aws_api_gateway_integration" "any_public_forum_proxy" {
  rest_api_id             = aws_api_gateway_rest_api.vinyl-lk.id
  resource_id             = aws_api_gateway_resource.public_forum_proxy.id
  http_method             = aws_api_gateway_method.any_public_forum_proxy.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = module.lambda-forum-service.lambda_function_invoke_arn
}

resource "aws_api_gateway_integration_response" "any_public_forum_proxy" {
  rest_api_id = aws_api_gateway_integration.any_public_forum_proxy.rest_api_id
  resource_id = aws_api_gateway_integration.any_public_forum_proxy.resource_id
  http_method = aws_api_gateway_integration.any_public_forum_proxy.http_method
  status_code = aws_api_gateway_method_response.any_public_forum_proxy.status_code

  response_templates = {
    "application/json" = ""
  }

  depends_on = [aws_api_gateway_integration.any_public_forum_proxy]
}

#
# API Function /public/market
#
resource "aws_api_gateway_resource" "public_market" {
  path_part   = "market"
  parent_id   = aws_api_gateway_resource.public.id
  rest_api_id = aws_api_gateway_rest_api.vinyl-lk.id
}

# ANY
resource "aws_api_gateway_method" "any_public_market" {
  rest_api_id   = aws_api_gateway_resource.public_market.rest_api_id
  resource_id   = aws_api_gateway_resource.public_market.id
  http_method   = "ANY"
  authorization = "NONE"
}

resource "aws_api_gateway_method_response" "any_public_market" {
  rest_api_id = aws_api_gateway_method.any_public_market.rest_api_id
  resource_id = aws_api_gateway_method.any_public_market.resource_id
  http_method = aws_api_gateway_method.any_public_market.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }

  response_models = {
    "application/json" = "Empty"
  }
}

#
# API Function /public/market/{proxy+}
#
resource "aws_api_gateway_resource" "public_market_proxy" {
  path_part   = "{proxy+}"
  parent_id   = aws_api_gateway_resource.public_market.id
  rest_api_id = aws_api_gateway_rest_api.vinyl-lk.id
}

# ANY
resource "aws_api_gateway_method" "any_public_market_proxy" {
  rest_api_id   = aws_api_gateway_resource.public_market_proxy.rest_api_id
  resource_id   = aws_api_gateway_resource.public_market_proxy.id
  http_method   = "ANY"
  authorization = "NONE"

  request_parameters = {
    "method.request.path.proxy" = true
  }
}

resource "aws_api_gateway_method_response" "any_public_market_proxy" {
  rest_api_id = aws_api_gateway_method.any_public_market_proxy.rest_api_id
  resource_id = aws_api_gateway_method.any_public_market_proxy.resource_id
  http_method = aws_api_gateway_method.any_public_market_proxy.http_method
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
module "cors-public_market" {
  source  = "squidfunk/api-gateway-enable-cors/aws"
  version = "0.3.3"

  api_id          = aws_api_gateway_rest_api.vinyl-lk.id
  api_resource_id = aws_api_gateway_resource.public_market.id
}

module "cors-public_market_proxy" {
  source  = "squidfunk/api-gateway-enable-cors/aws"
  version = "0.3.3"

  api_id          = aws_api_gateway_rest_api.vinyl-lk.id
  api_resource_id = aws_api_gateway_resource.public_market_proxy.id
}

#
# Integrations
#
resource "aws_api_gateway_integration" "any_public_market" {
  rest_api_id             = aws_api_gateway_rest_api.vinyl-lk.id
  resource_id             = aws_api_gateway_resource.public_market.id
  http_method             = aws_api_gateway_method.any_public_market.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = module.lambda-market-service.lambda_function_invoke_arn
}

resource "aws_api_gateway_integration_response" "any_public_market" {
  rest_api_id = aws_api_gateway_integration.any_public_market.rest_api_id
  resource_id = aws_api_gateway_integration.any_public_market.resource_id
  http_method = aws_api_gateway_integration.any_public_market.http_method
  status_code = aws_api_gateway_method_response.any_public_market.status_code

  response_templates = {
    "application/json" = ""
  }

  depends_on = [aws_api_gateway_integration.any_public_market]
}

resource "aws_api_gateway_integration" "any_public_market_proxy" {
  rest_api_id             = aws_api_gateway_rest_api.vinyl-lk.id
  resource_id             = aws_api_gateway_resource.public_market_proxy.id
  http_method             = aws_api_gateway_method.any_public_market_proxy.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = module.lambda-market-service.lambda_function_invoke_arn
}

resource "aws_api_gateway_integration_response" "any_public_market_proxy" {
  rest_api_id = aws_api_gateway_integration.any_public_market_proxy.rest_api_id
  resource_id = aws_api_gateway_integration.any_public_market_proxy.resource_id
  http_method = aws_api_gateway_integration.any_public_market_proxy.http_method
  status_code = aws_api_gateway_method_response.any_public_market_proxy.status_code

  response_templates = {
    "application/json" = ""
  }

  depends_on = [aws_api_gateway_integration.any_public_market_proxy]
}

#
# API Function /public/records
#
resource "aws_api_gateway_resource" "public_records" {
  path_part   = "records"
  parent_id   = aws_api_gateway_resource.public.id
  rest_api_id = aws_api_gateway_rest_api.vinyl-lk.id
}

# ANY
resource "aws_api_gateway_method" "any_public_records" {
  rest_api_id   = aws_api_gateway_resource.public_records.rest_api_id
  resource_id   = aws_api_gateway_resource.public_records.id
  http_method   = "ANY"
  authorization = "NONE"
}

resource "aws_api_gateway_method_response" "any_public_records" {
  rest_api_id = aws_api_gateway_method.any_public_records.rest_api_id
  resource_id = aws_api_gateway_method.any_public_records.resource_id
  http_method = aws_api_gateway_method.any_public_records.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }

  response_models = {
    "application/json" = "Empty"
  }
}

#
# API Function /public/records/{proxy+}
#
resource "aws_api_gateway_resource" "public_records_proxy" {
  path_part   = "{proxy+}"
  parent_id   = aws_api_gateway_resource.public_records.id
  rest_api_id = aws_api_gateway_rest_api.vinyl-lk.id
}

# ANY
resource "aws_api_gateway_method" "any_public_records_proxy" {
  rest_api_id   = aws_api_gateway_resource.public_records_proxy.rest_api_id
  resource_id   = aws_api_gateway_resource.public_records_proxy.id
  http_method   = "ANY"
  authorization = "NONE"

  request_parameters = {
    "method.request.path.proxy" = true
  }
}

resource "aws_api_gateway_method_response" "any_public_records_proxy" {
  rest_api_id = aws_api_gateway_method.any_public_records_proxy.rest_api_id
  resource_id = aws_api_gateway_method.any_public_records_proxy.resource_id
  http_method = aws_api_gateway_method.any_public_records_proxy.http_method
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
module "cors-public_records" {
  source  = "squidfunk/api-gateway-enable-cors/aws"
  version = "0.3.3"

  api_id          = aws_api_gateway_rest_api.vinyl-lk.id
  api_resource_id = aws_api_gateway_resource.public_records.id
}

module "cors-public_records_proxy" {
  source  = "squidfunk/api-gateway-enable-cors/aws"
  version = "0.3.3"

  api_id          = aws_api_gateway_rest_api.vinyl-lk.id
  api_resource_id = aws_api_gateway_resource.public_records_proxy.id
}

#
# Integrations
#
resource "aws_api_gateway_integration" "any_public_records" {
  rest_api_id             = aws_api_gateway_rest_api.vinyl-lk.id
  resource_id             = aws_api_gateway_resource.public_records.id
  http_method             = aws_api_gateway_method.any_public_records.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = module.lambda-records-service.lambda_function_invoke_arn
}

resource "aws_api_gateway_integration_response" "any_public_records" {
  rest_api_id = aws_api_gateway_integration.any_public_records.rest_api_id
  resource_id = aws_api_gateway_integration.any_public_records.resource_id
  http_method = aws_api_gateway_integration.any_public_records.http_method
  status_code = aws_api_gateway_method_response.any_public_records.status_code

  response_templates = {
    "application/json" = ""
  }

  depends_on = [aws_api_gateway_integration.any_public_records]
}

resource "aws_api_gateway_integration" "any_public_records_proxy" {
  rest_api_id             = aws_api_gateway_rest_api.vinyl-lk.id
  resource_id             = aws_api_gateway_resource.public_records_proxy.id
  http_method             = aws_api_gateway_method.any_public_records_proxy.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = module.lambda-records-service.lambda_function_invoke_arn
}

resource "aws_api_gateway_integration_response" "any_public_records_proxy" {
  rest_api_id = aws_api_gateway_integration.any_public_records_proxy.rest_api_id
  resource_id = aws_api_gateway_integration.any_public_records_proxy.resource_id
  http_method = aws_api_gateway_integration.any_public_records_proxy.http_method
  status_code = aws_api_gateway_method_response.any_public_records_proxy.status_code

  response_templates = {
    "application/json" = ""
  }

  depends_on = [aws_api_gateway_integration.any_public_records_proxy]
}
