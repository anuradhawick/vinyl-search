resource "aws_cloudfront_origin_access_control" "s3_distribution" {
  name                              = "vinyl-lk-s3-access-control-${terraform.workspace}"
  description                       = "Policy for vinyl.lk ${terraform.workspace}"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

data "aws_cloudfront_cache_policy" "s3_distribution" {
  name = "Managed-CachingOptimized"
}

resource "aws_cloudfront_distribution" "s3_distribution" {
  origin {
    domain_name              = aws_s3_bucket.vinyl-lk-bucket.bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.s3_distribution.id
    origin_id                = "vinyl-lk-s3-origin-id-${terraform.workspace}"
  }

  enabled         = true
  is_ipv6_enabled = true
  http_version    = "http2and3"

  # aliases = ["mysite.example.com", "yoursite.example.com"]

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "vinyl-lk-s3-origin-id-${terraform.workspace}"
    cache_policy_id = data.aws_cloudfront_cache_policy.s3_distribution.id

    min_ttl                = 0
    default_ttl            = 86400
    max_ttl                = 31536000
    compress               = true
    viewer_protocol_policy = "redirect-to-https"
  }

  price_class = "PriceClass_200"

  restrictions {
    geo_restriction {
      restriction_type = "none"
      locations        = []
    }
  }

  tags = var.common-tags

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}
