#
# API Gateway
#
resource "aws_api_gateway_rest_api" "vinyl-lk" {
  name        = "vinyl-lk-${terraform.workspace}"
  description = "Vinyl.lk API for ${terraform.workspace} environment"
}

#
# Deployment
#
resource "aws_api_gateway_deployment" "vinyl-lk" {
  rest_api_id = aws_api_gateway_rest_api.vinyl-lk.id

  lifecycle {
    create_before_destroy = true
  }

  stage_description = "Deployment for ${terraform.workspace}"

  triggers = {
    redeployment = sha1(jsonencode([
      # admin
      aws_api_gateway_resource.admin,
      aws_api_gateway_resource.admin_proxy,
      aws_api_gateway_method.any_admin_proxy,
      aws_api_gateway_method_response.any_admin_proxy,
      module.lambda-admin-service,
      # forum
      aws_api_gateway_resource.forum,
      aws_api_gateway_method.get_forum,
      aws_api_gateway_method_response.get_forum,
      aws_api_gateway_method.post_forum,
      aws_api_gateway_method_response.post_forum,
      aws_api_gateway_resource.forum_search,
      aws_api_gateway_method.get_forum_search,
      aws_api_gateway_method_response.get_forum_search,
      aws_api_gateway_resource.forum_id,
      aws_api_gateway_method.get_forum_id,
      aws_api_gateway_method_response.get_forum_id,
      aws_api_gateway_method.post_forum_id,
      aws_api_gateway_method_response.post_forum_id,
      aws_api_gateway_method.delete_forum_id,
      aws_api_gateway_method_response.delete_forum_id,
      aws_api_gateway_resource.forum_id_comments,
      aws_api_gateway_method.get_forum_id_comments,
      aws_api_gateway_method_response.get_forum_id_comments,
      aws_api_gateway_method.post_forum_id_comments,
      aws_api_gateway_method_response.post_forum_id_comments,
      aws_api_gateway_resource.forum_id_comments_id,
      aws_api_gateway_method.get_forum_id_comments_id,
      aws_api_gateway_method_response.get_forum_id_comments_id,
      aws_api_gateway_method.delete_forum_id_comments_id,
      aws_api_gateway_method_response.delete_forum_id_comments_id,
      aws_api_gateway_integration.get_forum,
      aws_api_gateway_integration_response.get_forum,
      aws_api_gateway_integration.post_forum,
      aws_api_gateway_integration_response.post_forum,
      aws_api_gateway_integration.get_forum_search,
      aws_api_gateway_integration_response.get_forum_search,
      aws_api_gateway_integration.get_forum_id,
      aws_api_gateway_integration_response.get_forum_id,
      aws_api_gateway_integration.post_forum_id,
      aws_api_gateway_integration_response.post_forum_id,
      aws_api_gateway_integration.delete_forum_id,
      aws_api_gateway_integration_response.delete_forum_id,
      aws_api_gateway_integration.get_forum_id_comments,
      aws_api_gateway_integration_response.get_forum_id_comments,
      aws_api_gateway_integration.post_forum_id_comments,
      aws_api_gateway_integration_response.post_forum_id_comments,
      aws_api_gateway_integration.get_forum_id_comments_id,
      aws_api_gateway_integration_response.get_forum_id_comments_id,
      aws_api_gateway_integration.delete_forum_id_comments_id,
      aws_api_gateway_integration_response.delete_forum_id_comments_id,
      # records
      aws_api_gateway_resource.records,
      aws_api_gateway_method.get_records,
      aws_api_gateway_method_response.get_records,
      aws_api_gateway_method.post_records,
      aws_api_gateway_method_response.post_records,
      aws_api_gateway_resource.records_search,
      aws_api_gateway_method.get_records_search,
      aws_api_gateway_method_response.get_records_search,
      aws_api_gateway_resource.records_id,
      aws_api_gateway_method.get_records_id,
      aws_api_gateway_method_response.get_records_id,
      aws_api_gateway_method.post_records_id,
      aws_api_gateway_method_response.post_records_id,
      aws_api_gateway_resource.records_id_revisions,
      aws_api_gateway_method.get_records_id_revisions,
      aws_api_gateway_method_response.get_records_id_revisions,
      aws_api_gateway_resource.records_id_revisions_id,
      aws_api_gateway_method.get_records_id_revisions_id,
      aws_api_gateway_method_response.get_records_id_revisions_id,
      aws_api_gateway_integration.get_records,
      aws_api_gateway_integration_response.get_records,
      aws_api_gateway_integration.post_records,
      aws_api_gateway_integration_response.post_records,
      aws_api_gateway_integration.get_records_id,
      aws_api_gateway_integration_response.get_records_id,
      aws_api_gateway_integration.post_records_id,
      aws_api_gateway_integration_response.post_records_id,
      aws_api_gateway_integration.get_records_id_revisions,
      aws_api_gateway_integration_response.get_records_id_revisions,
      aws_api_gateway_integration.get_records_id_revisions_id,
      aws_api_gateway_integration_response.get_records_id_revisions_id,
      aws_api_gateway_integration.get_records_search,
      aws_api_gateway_integration_response.get_records_search,
      # users
      aws_api_gateway_resource.users,
      aws_api_gateway_method.get_users,
      aws_api_gateway_method_response.get_users,
      aws_api_gateway_method.post_users,
      aws_api_gateway_method_response.post_users,
      aws_api_gateway_resource.users_forum,
      aws_api_gateway_method.get_users_forum,
      aws_api_gateway_method_response.get_users_forum,
      aws_api_gateway_resource.users_forum_id,
      aws_api_gateway_method.delete_users_forum_id,
      aws_api_gateway_method_response.delete_users_forum_id,
      aws_api_gateway_resource.users_records,
      aws_api_gateway_method.get_users_records,
      aws_api_gateway_method_response.get_users_records,
      aws_api_gateway_resource.users_records_id,
      aws_api_gateway_method.delete_users_records_id,
      aws_api_gateway_method_response.delete_users_records_id,
      aws_api_gateway_resource.users_market,
      aws_api_gateway_method.get_users_market,
      aws_api_gateway_method_response.get_users_market,
      aws_api_gateway_resource.users_market_id,
      aws_api_gateway_method.delete_users_market_id,
      aws_api_gateway_method_response.delete_users_market_id,
      aws_api_gateway_integration.get_users,
      aws_api_gateway_integration_response.get_users,
      aws_api_gateway_integration.delete_users_forum_id,
      aws_api_gateway_integration_response.delete_users_forum_id,
      aws_api_gateway_integration.post_users,
      aws_api_gateway_integration_response.post_users,
      aws_api_gateway_integration.get_users_forum,
      aws_api_gateway_integration_response.get_users_forum,
      aws_api_gateway_integration.get_users_market,
      aws_api_gateway_integration_response.get_users_market,
      aws_api_gateway_integration.delete_users_market_id,
      aws_api_gateway_integration_response.delete_users_market_id,
      aws_api_gateway_integration.get_users_records,
      aws_api_gateway_integration_response.get_users_records,
      aws_api_gateway_integration.delete_users_records_id,
      aws_api_gateway_integration_response.delete_users_records_id,
      aws_api_gateway_authorizer.vinyl-lk-authorizer,
      # market
      aws_api_gateway_resource.market,
      aws_api_gateway_method.get_market,
      aws_api_gateway_method_response.get_market,
      aws_api_gateway_method.post_market,
      aws_api_gateway_method_response.post_market,
      aws_api_gateway_resource.market_search,
      aws_api_gateway_method.get_market_search,
      aws_api_gateway_method_response.get_market_search,
      aws_api_gateway_resource.market_id,
      aws_api_gateway_method.get_market_id,
      aws_api_gateway_method_response.get_market_id,
      aws_api_gateway_method.post_market_id,
      aws_api_gateway_method_response.post_market_id,
      aws_api_gateway_method.delete_market_id,
      aws_api_gateway_method_response.delete_market_id,
      aws_api_gateway_resource.market_id_report,
      aws_api_gateway_method.get_market_id_report,
      aws_api_gateway_method_response.get_market_id_report,
      aws_api_gateway_method.post_market_id_report,
      aws_api_gateway_method_response.post_market_id_report,
      aws_api_gateway_integration.get_market,
      aws_api_gateway_integration_response.get_market,
      aws_api_gateway_integration.post_market,
      aws_api_gateway_integration_response.post_market,
      aws_api_gateway_integration.get_market_search,
      aws_api_gateway_integration_response.get_market_search,
      aws_api_gateway_integration.get_market_id,
      aws_api_gateway_integration_response.get_market_id,
      aws_api_gateway_integration.post_market_id,
      aws_api_gateway_integration_response.post_market_id,
      aws_api_gateway_integration.delete_market_id,
      aws_api_gateway_integration_response.delete_market_id,
      aws_api_gateway_integration.get_market_id_report,
      aws_api_gateway_integration_response.get_market_id_report,
      aws_api_gateway_integration.post_market_id_report,
      aws_api_gateway_integration_response.post_market_id_report,
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
  domain_name     = "${terraform.workspace == "prod" ? "" : terraform.workspace}api.vinyl.lk"
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
