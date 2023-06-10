resource "aws_s3_bucket" "vinyl-lk-bucket" {
  bucket_prefix = "vinyl-lk-data-bucket-${terraform.workspace}-"

  tags = var.common-tags
}

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
