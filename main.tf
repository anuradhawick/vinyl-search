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
