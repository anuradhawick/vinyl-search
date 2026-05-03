# define bucket
resource "aws_s3_bucket" "vinyl-lk-bucket" {
  bucket_prefix = "vinyl-lk-data-bucket-${terraform.workspace}-"
  force_destroy = terraform.workspace != "prod"

  tags = var.common-tags
}

resource "aws_s3_bucket_public_access_block" "vinyl-lk-bucket" {
  bucket = aws_s3_bucket.vinyl-lk-bucket.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "vinyl-lk-bucket" {
  bucket = aws_s3_bucket.vinyl-lk-bucket.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# allow cloudfront to access s3
resource "aws_s3_bucket_policy" "s3_access_from_cloudfront" {
  bucket = aws_s3_bucket.vinyl-lk-bucket.id
  policy = data.aws_iam_policy_document.s3_access_from_cloudfront.json

  depends_on = [aws_s3_bucket_public_access_block.vinyl-lk-bucket]
}

data "aws_iam_policy_document" "s3_access_from_cloudfront" {
  statement {
    principals {
      type = "Service"
      identifiers = [
        "cloudfront.amazonaws.com"
      ]
    }

    actions = [
      "s3:GetObject"
    ]

    resources = [
      "${aws_s3_bucket.vinyl-lk-bucket.arn}/*"
    ]

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values = [
        aws_cloudfront_distribution.s3_distribution.arn
      ]
    }
  }
}

# lifecycle
resource "aws_s3_bucket_lifecycle_configuration" "vinyl-lk-bucket-lifecycle" {
  bucket = aws_s3_bucket.vinyl-lk-bucket.id

  rule {
    id     = "delete-temps"
    status = "Enabled"

    filter {
      prefix = "temp/"
    }

    expiration {
      days = 2
    }
  }
}

# setup cors for remote uploads
resource "aws_s3_bucket_cors_configuration" "vinyl-lk-bucket" {
  bucket = aws_s3_bucket.vinyl-lk-bucket.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["PUT", "HEAD", "POST", "GET", "DELETE"]
    expose_headers  = ["ETag", "x-amz-multipart-parts-count", "x-amz-abort-date"]
    allowed_origins = ["*"]
    max_age_seconds = 3000
  }
}
