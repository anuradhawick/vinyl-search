#
# admin-service lambda Function
#
module "lambda-admin-service" {
  source  = "terraform-aws-modules/lambda/aws"
  version = "8.8.0"

  function_name                = "vinyl-lk-admin-service-${terraform.workspace}"
  description                  = "admin-service"
  handler                      = "bootstrap"
  runtime                      = "provided.al2023"
  architectures                = ["x86_64"]
  memory_size                  = 256
  timeout                      = 6
  tags                         = var.common-tags
  trigger_on_package_timestamp = false
  environment_variables = {
    MONGODB_ATLAS_CLUSTER_URI = local.MONGODB_ATLAS_CLUSTER_URI
    MONGODB_DATABASE_NAME     = local.MONGODB_DATABASE_NAME
    COGNITO_USER_POOL_ID      = aws_cognito_user_pool.vinyl-lk.id
    BUCKET_NAME               = aws_s3_bucket.vinyl-lk-bucket.id
    BUCKET_REGION             = var.region
    CDN_DOMAIN                = aws_route53_record.vinyl-lk-cdn.name
    NODE_OPTIONS              = "--enable-source-maps"
  }
  attach_policy_jsons = true
  policy_jsons = [
    data.aws_iam_policy_document.lambda-s3-full-access.json,
    data.aws_iam_policy_document.lambda-user-pool-triggers.json,
  ]
  number_of_policy_jsons = 2
  hash_extra             = filebase64sha256("${path.module}/../backend/administration-service/wm.png")
  source_path = [
    {
      patterns = ["!dist/", "!dist/.*"]
      path     = "${path.module}/../backend-go/admin",
      commands = [
        "rm -rf dist",
        "mkdir -p dist",
        "GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -trimpath -ldflags='-s -w' -o dist/bootstrap .",
        ":zip dist",
        ":zip ../../backend/administration-service/wm.png"
      ]
    }
  ]
}

#
# forum-service lambda Function
#
module "lambda-forum-service" {
  source  = "terraform-aws-modules/lambda/aws"
  version = "8.8.0"

  function_name                = "vinyl-lk-forum-service-${terraform.workspace}"
  description                  = "forum-service"
  handler                      = "bootstrap"
  runtime                      = "provided.al2023"
  architectures                = ["x86_64"]
  memory_size                  = 256
  timeout                      = 6
  tags                         = var.common-tags
  trigger_on_package_timestamp = false
  environment_variables = {
    MONGODB_ATLAS_CLUSTER_URI = local.MONGODB_ATLAS_CLUSTER_URI
    MONGODB_DATABASE_NAME     = local.MONGODB_DATABASE_NAME
    COGNITO_USER_POOL_ID      = aws_cognito_user_pool.vinyl-lk.id
    BUCKET_NAME               = aws_s3_bucket.vinyl-lk-bucket.id
    BUCKET_REGION             = var.region
    CDN_DOMAIN                = aws_route53_record.vinyl-lk-cdn.name
    NODE_OPTIONS              = "--enable-source-maps"
  }
  attach_policy_jsons = true
  policy_jsons = [
    data.aws_iam_policy_document.lambda-s3-full-access.json,
  ]
  number_of_policy_jsons = 1
  source_path = [
    {
      patterns = ["!dist/", "!dist/.*"]
      path     = "${path.module}/../backend-go/forum",
      commands = [
        "rm -rf dist",
        "mkdir -p dist",
        "GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -trimpath -ldflags='-s -w' -o dist/bootstrap .",
        ":zip dist"
      ]
    }
  ]
}

#
# market-service lambda Function
#
module "lambda-market-service" {
  source  = "terraform-aws-modules/lambda/aws"
  version = "8.8.0"

  function_name                = "vinyl-lk-market-service-${terraform.workspace}"
  description                  = "market-service"
  handler                      = "bootstrap"
  runtime                      = "provided.al2023"
  architectures                = ["x86_64"]
  memory_size                  = 256
  timeout                      = 6
  tags                         = var.common-tags
  trigger_on_package_timestamp = false
  environment_variables = {
    MONGODB_ATLAS_CLUSTER_URI = local.MONGODB_ATLAS_CLUSTER_URI
    MONGODB_DATABASE_NAME     = local.MONGODB_DATABASE_NAME
    COGNITO_USER_POOL_ID      = aws_cognito_user_pool.vinyl-lk.id
    BUCKET_NAME               = aws_s3_bucket.vinyl-lk-bucket.id
    BUCKET_REGION             = var.region
    CDN_DOMAIN                = aws_route53_record.vinyl-lk-cdn.name
    NODE_OPTIONS              = "--enable-source-maps"
  }
  attach_policy_jsons = true
  policy_jsons = [
    data.aws_iam_policy_document.lambda-s3-full-access.json,
  ]
  number_of_policy_jsons = 1
  hash_extra             = filebase64sha256("${path.module}/../backend/market-service/wm.png")
  source_path = [
    {
      patterns = ["!dist/", "!dist/.*"]
      path     = "${path.module}/../backend-go/market",
      commands = [
        "rm -rf dist",
        "mkdir -p dist",
        "GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -trimpath -ldflags='-s -w' -o dist/bootstrap .",
        ":zip dist",
        ":zip ../../backend/market-service/wm.png"
      ]
    }
  ]
}

#
# records-service lambda Function
#
module "lambda-records-service" {
  source  = "terraform-aws-modules/lambda/aws"
  version = "8.8.0"

  function_name                = "vinyl-lk-records-service-${terraform.workspace}"
  description                  = "records-service"
  handler                      = "bootstrap"
  runtime                      = "provided.al2023"
  architectures                = ["x86_64"]
  memory_size                  = 1024
  timeout                      = 29
  tags                         = var.common-tags
  trigger_on_package_timestamp = false
  environment_variables = {
    MONGODB_ATLAS_CLUSTER_URI = local.MONGODB_ATLAS_CLUSTER_URI
    MONGODB_DATABASE_NAME     = local.MONGODB_DATABASE_NAME
    COGNITO_USER_POOL_ID      = aws_cognito_user_pool.vinyl-lk.id
    BUCKET_NAME               = aws_s3_bucket.vinyl-lk-bucket.id
    BUCKET_REGION             = var.region
    CDN_DOMAIN                = aws_route53_record.vinyl-lk-cdn.name
    STAGE                     = ""
    NODE_OPTIONS              = "--enable-source-maps"
  }
  attach_policy_jsons = true
  policy_jsons = [
    data.aws_iam_policy_document.lambda-s3-full-access.json,
  ]
  number_of_policy_jsons = 1
  hash_extra             = filebase64sha256("${path.module}/../backend/records-management-service/wm.png")
  source_path = [
    {
      patterns = ["!dist/", "!dist/.*"]
      path     = "${path.module}/../backend-go/records",
      commands = [
        "rm -rf dist",
        "mkdir -p dist",
        "GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -trimpath -ldflags='-s -w' -o dist/bootstrap .",
        ":zip dist",
        ":zip ../../backend/records-management-service/wm.png"
      ]
    }
  ]
}

#
# user-service lambda Function
#
module "lambda-user-service" {
  source  = "terraform-aws-modules/lambda/aws"
  version = "8.8.0"

  function_name                = "vinyl-lk-user-service-${terraform.workspace}"
  description                  = "user-service"
  handler                      = "bootstrap"
  runtime                      = "provided.al2023"
  architectures                = ["x86_64"]
  memory_size                  = 256
  timeout                      = 6
  tags                         = var.common-tags
  trigger_on_package_timestamp = false
  environment_variables = {
    MONGODB_ATLAS_CLUSTER_URI = local.MONGODB_ATLAS_CLUSTER_URI
    MONGODB_DATABASE_NAME     = local.MONGODB_DATABASE_NAME
    COGNITO_USER_POOL_ID      = aws_cognito_user_pool.vinyl-lk.id
    BUCKET_NAME               = aws_s3_bucket.vinyl-lk-bucket.id
    BUCKET_REGION             = var.region
    NODE_OPTIONS              = "--enable-source-maps"
    CDN_DOMAIN                = aws_route53_record.vinyl-lk-cdn.name
  }
  attach_policy_jsons = true
  policy_jsons = [
    data.aws_iam_policy_document.lambda-s3-full-access.json,
  ]
  number_of_policy_jsons = 1
  source_path = [
    {
      patterns = ["!dist/", "!dist/.*"]
      path     = "${path.module}/../backend-go/users",
      commands = [
        "rm -rf dist",
        "mkdir -p dist",
        "GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -trimpath -ldflags='-s -w' -o dist/bootstrap .",
        ":zip dist"
      ]
    }
  ]
}

#
# user-pool-triggers lambda Function
#
module "lambda-user-pool-triggers" {
  source  = "terraform-aws-modules/lambda/aws"
  version = "8.8.0"

  function_name                = "vinyl-lk-user-pool-triggers-${terraform.workspace}"
  description                  = "user-pool-triggers"
  handler                      = "bootstrap"
  runtime                      = "provided.al2023"
  architectures                = ["x86_64"]
  memory_size                  = 128
  timeout                      = 6
  tags                         = var.common-tags
  trigger_on_package_timestamp = false
  environment_variables = {
    MONGODB_ATLAS_CLUSTER_URI = local.MONGODB_ATLAS_CLUSTER_URI
    MONGODB_DATABASE_NAME     = local.MONGODB_DATABASE_NAME
    NODE_OPTIONS              = "--enable-source-maps"
  }
  attach_policy_jsons = true
  policy_jsons = [
    data.aws_iam_policy_document.lambda-user-pool-triggers.json,
  ]
  number_of_policy_jsons = 1
  source_path = [
    {
      patterns = ["!dist/", "!dist/.*"]
      path     = "${path.module}/../backend-go/userpool-trigger",
      commands = [
        "rm -rf dist",
        "mkdir -p dist",
        "GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -trimpath -ldflags='-s -w' -o dist/bootstrap .",
        ":zip dist"
      ]
    }
  ]
}

# #
# # ssr lambda Function
# #
# module "lambda-ssr" {
#   source = "terraform-aws-modules/lambda/aws"

#   function_name = "vinyl-lk-ssr-${terraform.workspace}"
#   description   = "ssr"
#   handler       = "ssr.main"
#   runtime       = "nodejs18.x"
#   architectures = ["x86_64"]
#   memory_size   = 128
#   timeout       = 10
#   tags          = var.common-tags
#   environment_variables = {}
#   source_path = [
#     {
#       path = "${path.module}/../frontend/",
#       commands = [
#         "npm clean-install",
#         ":zip"
#       ]
#     }
#   ]
# }
