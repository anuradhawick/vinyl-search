terraform {
  required_version = ">= 1.15.1"
}

variable "region" {
  default = "ap-southeast-1"
  type    = string
}

variable "common-tags" {
  type = map(string)
  default = {
    NAME = "VINYL.LK"
  }
}

variable "frontend_install_command" {
  type        = string
  default     = "pnpm install --frozen-lockfile"
  description = "Command run before the Angular build. Set to an empty string to skip dependency installation."
}

variable "frontend_build_command" {
  type        = string
  default     = "pnpm exec ng build --configuration production"
  description = "Command used by Terraform to build the Angular frontend."
}

variable "ACM_CERT" {
  type = string
}

variable "R53_ZONE_ID" {
  type = string
}

variable "MONGODB_ATLAS_CLUSTER_URI_DEV" {
  type      = string
  sensitive = true
}

variable "MONGODB_ATLAS_CLUSTER_URI_PROD" {
  type      = string
  sensitive = true
}

variable "GOOGLE_CLIENT_ID" {
  type = string
}

variable "GOOGLE_CLIENT_SECRET" {
  type      = string
  sensitive = true
}

variable "FACEBOOK_CLIENT_ID" {
  type = string
}

variable "FACEBOOK_CLIENT_SECRET" {
  type      = string
  sensitive = true
}

module "backend" {
  source = "./backend-terraform-aws"

  region                         = var.region
  common-tags                    = var.common-tags
  ACM_CERT                       = var.ACM_CERT
  R53_ZONE_ID                    = var.R53_ZONE_ID
  MONGODB_ATLAS_CLUSTER_URI_DEV  = var.MONGODB_ATLAS_CLUSTER_URI_DEV
  MONGODB_ATLAS_CLUSTER_URI_PROD = var.MONGODB_ATLAS_CLUSTER_URI_PROD
  GOOGLE_CLIENT_ID               = var.GOOGLE_CLIENT_ID
  GOOGLE_CLIENT_SECRET           = var.GOOGLE_CLIENT_SECRET
  FACEBOOK_CLIENT_ID             = var.FACEBOOK_CLIENT_ID
  FACEBOOK_CLIENT_SECRET         = var.FACEBOOK_CLIENT_SECRET
}

module "frontend" {
  source = "./frontend-terraform-aws"

  region              = var.region
  common-tags         = module.backend.common_tags
  acm_certificate_arn = module.backend.acm_certificate_arn
  route53_zone_id     = module.backend.route53_zone_id
  frontend_config     = module.backend.frontend_config
  install_command     = var.frontend_install_command
  build_command       = var.frontend_build_command
}

output "api_gateway_endpoint" {
  value       = module.backend.api_gateway_endpoint
  description = "Custom domain API endpoint used by the frontend."
}

output "cdn_url" {
  value       = module.backend.cdn_url
  description = "CDN URL for S3 objects."
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

output "gui_urls" {
  value       = module.frontend.gui_urls
  description = "Frontend URLs for the current workspace."
}
