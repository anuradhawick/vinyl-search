# lambda-user-pool-triggers
data "aws_iam_policy_document" "lambda-user-pool-triggers" {
  statement {
    actions = [
      "cognito-idp:*"
    ]
    resources = [
      "*"
    ]
  }
}

# lambda-s3-full-access
data "aws_iam_policy_document" "lambda-s3-full-access" {
  statement {
    actions = [
      "s3:*",
    ]
    resources = [
      "arn:aws:s3:::${aws_s3_bucket.vinyl-lk-bucket.id}",
      "arn:aws:s3:::${aws_s3_bucket.vinyl-lk-bucket.id}/*"
    ]
  }
}
