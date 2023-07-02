# define bucket
resource "aws_s3_bucket" "vinyl-lk-bucket" {
  bucket_prefix = "vinyl-lk-data-bucket-${terraform.workspace}-"

  tags = var.common-tags
}

# allow cloudfront to access s3
resource "aws_s3_bucket_policy" "s3_access_from_cloudfront" {
  bucket = aws_s3_bucket.vinyl-lk-bucket.id
  policy = data.aws_iam_policy_document.s3_access_from_cloudfront.json
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
    allowed_methods = ["PUT", "POST"]
    expose_headers  = ["ETag"]
    allowed_origins = ["*"]
  }
}
