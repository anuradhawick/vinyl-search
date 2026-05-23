#
# API Function /market
#
resource "aws_api_gateway_resource" "market" {
  path_part   = "market"
  parent_id   = aws_api_gateway_rest_api.vinyl-lk.root_resource_id
  rest_api_id = aws_api_gateway_rest_api.vinyl-lk.id
}

# ANY
resource "aws_api_gateway_method" "any_market" {
  rest_api_id   = aws_api_gateway_resource.market.rest_api_id
  resource_id   = aws_api_gateway_resource.market.id
  http_method   = "ANY"
  authorization = "NONE"
}

resource "aws_api_gateway_method_response" "any_market" {
  rest_api_id = aws_api_gateway_method.any_market.rest_api_id
  resource_id = aws_api_gateway_method.any_market.resource_id
  http_method = aws_api_gateway_method.any_market.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }

  response_models = {
    "application/json" = "Empty"
  }
}

#
# API Function /market/{proxy+}
#
resource "aws_api_gateway_resource" "market_proxy" {
  path_part   = "{proxy+}"
  parent_id   = aws_api_gateway_resource.market.id
  rest_api_id = aws_api_gateway_rest_api.vinyl-lk.id
}

# ANY
resource "aws_api_gateway_method" "any_market_proxy" {
  rest_api_id   = aws_api_gateway_resource.market_proxy.rest_api_id
  resource_id   = aws_api_gateway_resource.market_proxy.id
  http_method   = "ANY"
  authorization = "NONE"

  request_parameters = {
    "method.request.path.proxy" = true
  }
}

resource "aws_api_gateway_method_response" "any_market_proxy" {
  rest_api_id = aws_api_gateway_method.any_market_proxy.rest_api_id
  resource_id = aws_api_gateway_method.any_market_proxy.resource_id
  http_method = aws_api_gateway_method.any_market_proxy.http_method
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

module "cors-market_proxy" {
  source  = "squidfunk/api-gateway-enable-cors/aws"
  version = "0.3.3"

  api_id          = aws_api_gateway_rest_api.vinyl-lk.id
  api_resource_id = aws_api_gateway_resource.market_proxy.id
}

#
# Integrations
#
resource "aws_api_gateway_integration" "any_market" {
  rest_api_id             = aws_api_gateway_rest_api.vinyl-lk.id
  resource_id             = aws_api_gateway_resource.market.id
  http_method             = aws_api_gateway_method.any_market.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = module.lambda-market-service.lambda_function_invoke_arn
}

resource "aws_api_gateway_integration_response" "any_market" {
  rest_api_id = aws_api_gateway_integration.any_market.rest_api_id
  resource_id = aws_api_gateway_integration.any_market.resource_id
  http_method = aws_api_gateway_integration.any_market.http_method
  status_code = aws_api_gateway_method_response.any_market.status_code

  response_templates = {
    "application/json" = ""
  }

  depends_on = [aws_api_gateway_integration.any_market]
}

resource "aws_api_gateway_integration" "any_market_proxy" {
  rest_api_id             = aws_api_gateway_rest_api.vinyl-lk.id
  resource_id             = aws_api_gateway_resource.market_proxy.id
  http_method             = aws_api_gateway_method.any_market_proxy.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = module.lambda-market-service.lambda_function_invoke_arn
}

resource "aws_api_gateway_integration_response" "any_market_proxy" {
  rest_api_id = aws_api_gateway_integration.any_market_proxy.rest_api_id
  resource_id = aws_api_gateway_integration.any_market_proxy.resource_id
  http_method = aws_api_gateway_integration.any_market_proxy.http_method
  status_code = aws_api_gateway_method_response.any_market_proxy.status_code

  response_templates = {
    "application/json" = ""
  }

  depends_on = [aws_api_gateway_integration.any_market_proxy]
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
