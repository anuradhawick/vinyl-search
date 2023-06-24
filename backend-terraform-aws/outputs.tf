# API
output "api_gateway_url" {
  value       = aws_api_gateway_deployment.vinyl-lk.invoke_url
  description = "URL used to invoke the API."
}

output "api_domain" {
  value       = aws_api_gateway_domain_name.vinyl-lk-api.domain_name
  description = "URL with domain to invoke the API."
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
  description = "OAuth fomain for Amplify."
}

# Storage
output "s3_bucket_name" {
  value       = aws_s3_bucket.vinyl-lk-bucket.id
  description = "S3 bucket name for Amplify"
}
