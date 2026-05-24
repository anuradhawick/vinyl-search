#
# API Gateway
#
resource "aws_api_gateway_rest_api" "vinyl-lk" {
  name        = "vinyl-lk-${terraform.workspace}"
  description = "Vinyl.lk API for ${terraform.workspace} environment"
}

resource "aws_api_gateway_resource" "public" {
  path_part   = "public"
  parent_id   = aws_api_gateway_rest_api.vinyl-lk.root_resource_id
  rest_api_id = aws_api_gateway_rest_api.vinyl-lk.id
}

#
# Deployment
#
resource "aws_api_gateway_deployment" "vinyl-lk" {
  rest_api_id = aws_api_gateway_rest_api.vinyl-lk.id

  lifecycle {
    create_before_destroy = true
  }

  triggers = {
    redeployment = sha1(jsonencode([
      aws_api_gateway_resource.admin,
      aws_api_gateway_resource.admin_proxy,
      aws_api_gateway_method.any_admin_proxy,
      aws_api_gateway_method_response.any_admin_proxy,
      aws_api_gateway_integration.any_admin_proxy,
      aws_api_gateway_integration_response.any_admin_proxy,
      aws_api_gateway_resource.public,
      aws_api_gateway_resource.public_forum,
      aws_api_gateway_resource.public_forum_proxy,
      aws_api_gateway_method.any_public_forum,
      aws_api_gateway_method_response.any_public_forum,
      aws_api_gateway_method.any_public_forum_proxy,
      aws_api_gateway_method_response.any_public_forum_proxy,
      aws_api_gateway_integration.any_public_forum,
      aws_api_gateway_integration_response.any_public_forum,
      aws_api_gateway_integration.any_public_forum_proxy,
      aws_api_gateway_integration_response.any_public_forum_proxy,
      aws_api_gateway_resource.forum,
      aws_api_gateway_resource.forum_proxy,
      aws_api_gateway_method.any_forum,
      aws_api_gateway_method_response.any_forum,
      aws_api_gateway_method.any_forum_proxy,
      aws_api_gateway_method_response.any_forum_proxy,
      aws_api_gateway_integration.any_forum,
      aws_api_gateway_integration_response.any_forum,
      aws_api_gateway_integration.any_forum_proxy,
      aws_api_gateway_integration_response.any_forum_proxy,
      aws_api_gateway_resource.public_records,
      aws_api_gateway_resource.public_records_proxy,
      aws_api_gateway_method.any_public_records,
      aws_api_gateway_method_response.any_public_records,
      aws_api_gateway_method.any_public_records_proxy,
      aws_api_gateway_method_response.any_public_records_proxy,
      aws_api_gateway_integration.any_public_records,
      aws_api_gateway_integration_response.any_public_records,
      aws_api_gateway_integration.any_public_records_proxy,
      aws_api_gateway_integration_response.any_public_records_proxy,
      aws_api_gateway_resource.records,
      aws_api_gateway_resource.records_proxy,
      aws_api_gateway_method.any_records,
      aws_api_gateway_method_response.any_records,
      aws_api_gateway_method.any_records_proxy,
      aws_api_gateway_method_response.any_records_proxy,
      aws_api_gateway_integration.any_records,
      aws_api_gateway_integration_response.any_records,
      aws_api_gateway_integration.any_records_proxy,
      aws_api_gateway_integration_response.any_records_proxy,
      aws_api_gateway_resource.public_market,
      aws_api_gateway_resource.public_market_proxy,
      aws_api_gateway_method.any_public_market,
      aws_api_gateway_method_response.any_public_market,
      aws_api_gateway_method.any_public_market_proxy,
      aws_api_gateway_method_response.any_public_market_proxy,
      aws_api_gateway_integration.any_public_market,
      aws_api_gateway_integration_response.any_public_market,
      aws_api_gateway_integration.any_public_market_proxy,
      aws_api_gateway_integration_response.any_public_market_proxy,
      aws_api_gateway_resource.users,
      aws_api_gateway_resource.users_proxy,
      aws_api_gateway_method.any_users,
      aws_api_gateway_method_response.any_users,
      aws_api_gateway_method.any_users_proxy,
      aws_api_gateway_method_response.any_users_proxy,
      aws_api_gateway_integration.any_users,
      aws_api_gateway_integration_response.any_users,
      aws_api_gateway_integration.any_users_proxy,
      aws_api_gateway_integration_response.any_users_proxy,
      aws_api_gateway_resource.market,
      aws_api_gateway_resource.market_proxy,
      aws_api_gateway_method.any_market,
      aws_api_gateway_method_response.any_market,
      aws_api_gateway_method.any_market_proxy,
      aws_api_gateway_method_response.any_market_proxy,
      aws_api_gateway_integration.any_market,
      aws_api_gateway_integration_response.any_market,
      aws_api_gateway_integration.any_market_proxy,
      aws_api_gateway_integration_response.any_market_proxy,
    ]))
  }
}

# stage
resource "aws_api_gateway_stage" "vinyl-lk" {
  deployment_id = aws_api_gateway_deployment.vinyl-lk.id
  rest_api_id   = aws_api_gateway_rest_api.vinyl-lk.id
  stage_name    = terraform.workspace
}

# domains
resource "aws_api_gateway_domain_name" "vinyl-lk-api" {
  certificate_arn = var.ACM_CERT
  domain_name     = local.api_domain_name
  security_policy = "TLS_1_2"
}

resource "aws_api_gateway_base_path_mapping" "vinyl-lk-api" {
  api_id      = aws_api_gateway_rest_api.vinyl-lk.id
  stage_name  = aws_api_gateway_stage.vinyl-lk.stage_name
  domain_name = aws_api_gateway_domain_name.vinyl-lk-api.domain_name
}

resource "aws_route53_record" "vinyl-lk-api" {
  name    = aws_api_gateway_domain_name.vinyl-lk-api.domain_name
  type    = "A"
  zone_id = var.R53_ZONE_ID

  alias {
    evaluate_target_health = false
    name                   = aws_api_gateway_domain_name.vinyl-lk-api.cloudfront_domain_name
    zone_id                = aws_api_gateway_domain_name.vinyl-lk-api.cloudfront_zone_id
  }
}
