output "gui_bucket_name" {
  value       = aws_s3_bucket.gui.id
  description = "S3 bucket that stores the Angular browser build."
}

output "gui_cloudfront_distribution_id" {
  value       = aws_cloudfront_distribution.gui.id
  description = "CloudFront distribution id for the Angular frontend."
}

output "gui_cloudfront_domain_name" {
  value       = aws_cloudfront_distribution.gui.domain_name
  description = "CloudFront distribution domain name for the Angular frontend."
}

output "gui_domain_names" {
  value       = var.frontend_config.application_domain_names
  description = "Frontend domains for the current workspace."
}

output "gui_urls" {
  value       = var.frontend_config.application_urls
  description = "Frontend URLs for the current workspace."
}

output "angular_build_hash" {
  value       = data.external.angular_build.result.hash
  description = "Hash of the Angular browser build uploaded to S3."
}
