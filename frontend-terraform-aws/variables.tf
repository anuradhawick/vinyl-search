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

variable "acm_certificate_arn" {
  type        = string
  description = "ACM certificate ARN for the frontend CloudFront aliases."
}

variable "route53_zone_id" {
  type        = string
  description = "Route53 hosted zone id for the frontend aliases."
}

variable "frontend_config" {
  type = object({
    region                   = string
    api_endpoint             = string
    cdn_url                  = string
    identity_pool_id         = string
    user_pool_id             = string
    user_pool_client_id      = string
    oauth_domain             = string
    storage_bucket_name      = string
    application_domain_names = list(string)
    application_urls         = list(string)
  })
  description = "Angular runtime configuration captured from backend Terraform outputs."
}

variable "webapp_dir" {
  type        = string
  default     = "../frontend"
  description = "Path to the Angular app, relative to this module."
}

variable "build_output_dir" {
  type        = string
  default     = "../frontend/dist/vinyl-lk/browser"
  description = "Path to the Angular browser build output, relative to this module."
}

variable "install_command" {
  type        = string
  default     = "pnpm install --frozen-lockfile"
  description = "Command run before the Angular build. Set to an empty string to skip dependency installation."
}

variable "build_command" {
  type        = string
  default     = "pnpm exec ng build --configuration production"
  description = "Command run after the environment file is generated."
}
