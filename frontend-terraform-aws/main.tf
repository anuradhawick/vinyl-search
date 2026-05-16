provider "aws" {
  region = var.region
}

locals {
  webapp_dir       = abspath("${path.module}/${var.webapp_dir}")
  build_output_dir = abspath("${path.module}/${var.build_output_dir}")
  origin_id        = "vinyl-lk-gui-origin-id-${terraform.workspace}"
  build_hash       = data.external.angular_build.result.hash
  dist_files       = toset(local.build_hash != "" ? fileset(local.build_output_dir, "**") : [])

  mime_types = {
    ".css"         = "text/css"
    ".gif"         = "image/gif"
    ".html"        = "text/html"
    ".ico"         = "image/x-icon"
    ".jpeg"        = "image/jpeg"
    ".jpg"         = "image/jpeg"
    ".js"          = "application/javascript"
    ".json"        = "application/json"
    ".map"         = "application/json"
    ".mjs"         = "application/javascript"
    ".png"         = "image/png"
    ".svg"         = "image/svg+xml"
    ".ttf"         = "font/ttf"
    ".txt"         = "text/plain"
    ".webmanifest" = "application/manifest+json"
    ".webp"        = "image/webp"
    ".woff"        = "font/woff"
    ".woff2"       = "font/woff2"
    ".xml"         = "application/xml"
  }
}

data "external" "angular_build" {
  program = ["go", "run", "${path.module}/build.go"]

  query = {
    workspace             = terraform.workspace
    production            = tostring(terraform.workspace == "prod")
    webapp_dir            = local.webapp_dir
    build_destination     = local.build_output_dir
    install_command       = var.install_command
    build_command         = var.build_command
    region                = var.frontend_config.region
    identity_pool_id      = var.frontend_config.identity_pool_id
    user_pool_id          = var.frontend_config.user_pool_id
    user_pool_client_id   = var.frontend_config.user_pool_client_id
    oauth_domain          = var.frontend_config.oauth_domain
    storage_bucket_name   = var.frontend_config.storage_bucket_name
    api_endpoint          = var.frontend_config.api_endpoint
    cdn_url               = var.frontend_config.cdn_url
    application_urls_json = jsonencode(var.frontend_config.application_urls)
    application_api_name  = "[vinyl.lk]"
  }
}

resource "aws_s3_bucket" "gui" {
  bucket_prefix = "vinyl-lk-gui-bucket-${terraform.workspace}-"
  force_destroy = terraform.workspace != "prod"

  tags = var.common-tags
}

resource "aws_s3_bucket_public_access_block" "gui" {
  bucket = aws_s3_bucket.gui.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "gui" {
  bucket = aws_s3_bucket.gui.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_cloudfront_origin_access_control" "gui" {
  name                              = "vinyl-lk-gui-s3-access-control-${terraform.workspace}"
  description                       = "Policy for vinyl.lk GUI ${terraform.workspace}"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

data "aws_cloudfront_cache_policy" "gui" {
  name = "Managed-CachingOptimized"
}

resource "aws_cloudfront_distribution" "gui" {
  origin {
    domain_name              = aws_s3_bucket.gui.bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.gui.id
    origin_id                = local.origin_id
  }

  aliases             = var.frontend_config.application_domain_names
  default_root_object = "index.html"
  enabled             = true
  http_version        = "http2and3"
  is_ipv6_enabled     = true
  price_class         = "PriceClass_200"

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    cache_policy_id        = data.aws_cloudfront_cache_policy.gui.id
    compress               = true
    target_origin_id       = local.origin_id
    viewer_protocol_policy = "redirect-to-https"
  }

  custom_error_response {
    error_caching_min_ttl = 0
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
  }

  custom_error_response {
    error_caching_min_ttl = 0
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
  }

  restrictions {
    geo_restriction {
      locations        = []
      restriction_type = "none"
    }
  }

  tags = var.common-tags

  viewer_certificate {
    acm_certificate_arn      = var.acm_certificate_arn
    minimum_protocol_version = "TLSv1.2_2025"
    ssl_support_method       = "sni-only"
  }
}

data "aws_iam_policy_document" "gui_access_from_cloudfront" {
  statement {
    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    actions = ["s3:GetObject"]

    resources = [
      "${aws_s3_bucket.gui.arn}/*"
    ]

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values = [
        aws_cloudfront_distribution.gui.arn
      ]
    }
  }
}

resource "aws_s3_bucket_policy" "gui_access_from_cloudfront" {
  bucket = aws_s3_bucket.gui.id
  policy = data.aws_iam_policy_document.gui_access_from_cloudfront.json

  depends_on = [aws_s3_bucket_public_access_block.gui]
}

resource "aws_s3_object" "gui" {
  for_each = local.dist_files

  bucket        = aws_s3_bucket.gui.id
  key           = each.value
  source        = "${local.build_output_dir}/${each.value}"
  source_hash   = filemd5("${local.build_output_dir}/${each.value}")
  content_type  = lookup(local.mime_types, lower(try(regex("\\.[^.]+$", each.value), "")), "application/octet-stream")
  cache_control = each.value == "index.html" ? "no-cache" : "public, max-age=86400"
}

resource "aws_route53_record" "gui" {
  for_each = toset(var.frontend_config.application_domain_names)

  name    = each.value
  type    = "A"
  zone_id = var.route53_zone_id

  alias {
    evaluate_target_health = false
    name                   = aws_cloudfront_distribution.gui.domain_name
    zone_id                = aws_cloudfront_distribution.gui.hosted_zone_id
  }
}

resource "aws_route53_record" "gui_ipv6" {
  for_each = toset(var.frontend_config.application_domain_names)

  name    = each.value
  type    = "AAAA"
  zone_id = var.route53_zone_id

  alias {
    evaluate_target_health = false
    name                   = aws_cloudfront_distribution.gui.domain_name
    zone_id                = aws_cloudfront_distribution.gui.hosted_zone_id
  }
}
