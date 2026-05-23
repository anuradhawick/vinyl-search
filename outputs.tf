output "api_gateway_url" {
  value       = module.backend.api_gateway_url
  description = "Regional API Gateway stage invoke URL."
}

output "api_domain" {
  value       = module.backend.api_domain
  description = "Custom API domain name."
}

output "api_gateway_endpoint" {
  value       = module.backend.api_gateway_endpoint
  description = "Custom domain API endpoint used by the frontend."
}

output "cdn_domain" {
  value       = module.backend.cdn_domain
  description = "Custom CDN domain for S3 objects."
}

output "cdn_url" {
  value       = module.backend.cdn_url
  description = "CDN URL for S3 objects."
}

output "oauth_domain" {
  value       = module.backend.oauth_domain
  description = "Cognito OAuth domain."
}

output "oauth_redirect_urls" {
  value       = module.backend.oauth_redirect_urls
  description = "Allowed callback and logout URLs for the Cognito app client."
}

output "identity_pool_id" {
  value       = module.backend.identity_pool_id
  description = "Cognito identity pool id for Amplify."
}

output "user_pool_id" {
  value       = module.backend.user_pool_id
  description = "Cognito user pool id."
}

output "user_pool_client_id" {
  value       = module.backend.user_pool_client_id
  description = "Cognito user pool app client id."
}

output "s3_bucket_name" {
  value       = module.backend.s3_bucket_name
  description = "Backend S3 bucket name used by the app."
}

output "frontend_config" {
  value       = module.backend.frontend_config
  description = "Configuration used to build and host the Angular frontend."
}

output "gui_bucket_name" {
  value       = module.frontend.gui_bucket_name
  description = "S3 bucket that stores the Angular browser build."
}

output "gui_cloudfront_distribution_id" {
  value       = module.frontend.gui_cloudfront_distribution_id
  description = "CloudFront distribution id for the Angular frontend."
}

output "gui_cloudfront_domain_name" {
  value       = module.frontend.gui_cloudfront_domain_name
  description = "CloudFront distribution domain name for the Angular frontend."
}

output "gui_domain_names" {
  value       = module.frontend.gui_domain_names
  description = "Frontend custom domain names for the current workspace."
}

output "gui_urls" {
  value       = module.frontend.gui_urls
  description = "Frontend URLs for the current workspace."
}

output "jwt_bearer_token_cli_command" {
  value       = <<-EOT
    VINYL_LK_PASSWORD='replace-me' aws cognito-idp admin-initiate-auth \
      --region ${var.region} \
      --user-pool-id ${module.backend.user_pool_id} \
      --client-id ${module.backend.user_pool_client_id} \
      --auth-flow ADMIN_USER_PASSWORD_AUTH \
      --auth-parameters USERNAME=anuradhawick@gmail.com,PASSWORD="$VINYL_LK_PASSWORD" \
      --query "join('', ['Bearer ', AuthenticationResult.IdToken])" \
      --output text
  EOT
  description = "AWS CLI command that returns a JWT bearer token for anuradhawick@gmail.com."
}
