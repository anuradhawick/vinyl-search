# API
output "api_gateway_url" {
  value       = aws_api_gateway_stage.vinyl-lk.invoke_url
  description = "URL used to invoke the API."
}

output "api_domain" {
  value       = aws_api_gateway_domain_name.vinyl-lk-api.domain_name
  description = "URL with domain to invoke the API."
}

output "api_gateway_endpoint" {
  value       = "https://${aws_api_gateway_domain_name.vinyl-lk-api.domain_name}/"
  description = "Custom domain API endpoint used by the frontend."
}

# Auth
output "identity_pool_id" {
  value       = aws_cognito_identity_pool.vinyl-lk-idp.id
  description = "Identity pool id for Amplify."
}

output "user_pool_id" {
  value       = aws_cognito_user_pool.vinyl-lk.id
  description = "User pool id for Amplify."
}

output "user_pool_client_id" {
  value       = aws_cognito_user_pool_client.vinyl-lk-client.id
  description = "User pool client id for Amplify."
}

output "oauth_domain" {
  value       = aws_cognito_user_pool_domain.vinyl-lk-auth.domain
  description = "OAuth domain for Amplify."
}

output "oauth_redirect_urls" {
  value       = local.oauth_redirect_urls
  description = "Allowed callback and logout URLs for the Cognito app client."
}

# Storage
output "s3_bucket_name" {
  value       = aws_s3_bucket.vinyl-lk-bucket.id
  description = "S3 bucket name for Amplify"
}

output "cdn_domain" {
  value       = aws_route53_record.vinyl-lk-cdn.name
  description = "CDN domain for S3 objects."
}

output "cdn_url" {
  value       = "https://${aws_route53_record.vinyl-lk-cdn.name}/"
  description = "CDN URL for S3 objects."
}

# Frontend deployment
output "application_domain_names" {
  value       = local.frontend_domain_names
  description = "Frontend domains for the current workspace."
}

output "application_urls" {
  value       = local.frontend_urls
  description = "Frontend URLs for the current workspace."
}

output "acm_certificate_arn" {
  value       = var.ACM_CERT
  description = "ACM certificate ARN shared with frontend CloudFront."
}

output "route53_zone_id" {
  value       = var.R53_ZONE_ID
  description = "Route53 hosted zone id shared with frontend DNS."
}

output "common_tags" {
  value       = var.common-tags
  description = "Tags shared with frontend infrastructure."
}

output "frontend_config" {
  value = {
    region                   = var.region
    api_endpoint             = "https://${aws_api_gateway_domain_name.vinyl-lk-api.domain_name}/"
    cdn_url                  = "https://${aws_route53_record.vinyl-lk-cdn.name}/"
    identity_pool_id         = aws_cognito_identity_pool.vinyl-lk-idp.id
    user_pool_id             = aws_cognito_user_pool.vinyl-lk.id
    user_pool_client_id      = aws_cognito_user_pool_client.vinyl-lk-client.id
    oauth_domain             = aws_cognito_user_pool_domain.vinyl-lk-auth.domain
    storage_bucket_name      = aws_s3_bucket.vinyl-lk-bucket.id
    application_domain_names = local.frontend_domain_names
    application_urls         = local.frontend_urls
  }
  description = "Configuration required to build and host the Angular frontend."
}
