#
# admin-service lambda Function
#
module "lambda-admin-service" {
  source = "terraform-aws-modules/lambda/aws"

  function_name = "vinyl-lk-admin-service-${terraform.workspace}"
  description   = "admin-service"
  handler       = "admin-main.main"
  runtime       = "nodejs18.x"
  architectures = ["x86_64"]
  memory_size   = 256
  timeout       = 6
  tags          = var.common-tags
  environment_variables = {
    MONGODB_ATLAS_CLUSTER_URI = local.MONGODB_ATLAS_CLUSTER_URI
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
      path = "${path.module}/../backend/administration-service",
      commands = [
        "npm install",
        "./node_modules/.bin/esbuild --sourcemap --bundle admin-main.js --outdir=dist --platform=node --target=node18 --preserve-symlinks --external:@aws-sdk/client-s3 --external:@aws-sdk/client-cognito-identity-provider",
        "cd dist",
        ":zip"
      ]
    }
  ]
}

#
# forum-service lambda Function
#
module "lambda-forum-service" {
  source = "terraform-aws-modules/lambda/aws"

  function_name = "vinyl-lk-forum-service-${terraform.workspace}"
  description   = "forum-service"
  handler       = "forum-main.main"
  runtime       = "nodejs18.x"
  architectures = ["x86_64"]
  memory_size   = 256
  timeout       = 6
  tags          = var.common-tags
  environment_variables = {
    MONGODB_ATLAS_CLUSTER_URI = local.MONGODB_ATLAS_CLUSTER_URI
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
      path = "${path.module}/../backend/forum-management-service",
      commands = [
        "npm install",
        "./node_modules/.bin/esbuild --sourcemap --bundle forum-main.js --outdir=dist --platform=node --target=node18 --preserve-symlinks --external:@aws-sdk/client-s3 --external:@aws-sdk/client-cognito-identity-provider",
        "cd dist",
        ":zip"
      ]
    }
  ]
}

#
# market-service lambda Function
#
module "lambda-market-service" {
  source = "terraform-aws-modules/lambda/aws"

  function_name = "vinyl-lk-market-service-${terraform.workspace}"
  description   = "market-service"
  handler       = "market-main.main"
  runtime       = "nodejs18.x"
  architectures = ["x86_64"]
  memory_size   = 256
  timeout       = 6
  tags          = var.common-tags
  environment_variables = {
    MONGODB_ATLAS_CLUSTER_URI = local.MONGODB_ATLAS_CLUSTER_URI
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
      path = "${path.module}/../backend/market-service",
      commands = [
        "npm install",
        "./node_modules/.bin/esbuild --sourcemap --bundle market-main.js --outdir=dist --platform=node --target=node18 --preserve-symlinks --external:@aws-sdk/client-s3",
        "cd dist",
        ":zip"
      ]
    }
  ]
}

#
# records-service lambda Function
#
module "lambda-records-service" {
  source = "terraform-aws-modules/lambda/aws"

  function_name = "vinyl-lk-records-service-${terraform.workspace}"
  description   = "records-service"
  handler       = "records-main.main"
  runtime       = "nodejs18.x"
  architectures = ["x86_64"]
  memory_size   = 256
  timeout       = 6
  tags          = var.common-tags
  environment_variables = {
    MONGODB_ATLAS_CLUSTER_URI = local.MONGODB_ATLAS_CLUSTER_URI
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
  source_path = [
    {
      path = "${path.module}/../backend/records-management-service",
      commands = [
        "npm install",
        "./node_modules/.bin/esbuild --sourcemap --bundle records-main.js --outdir=dist --platform=node --target=node18 --preserve-symlinks --external:@aws-sdk/client-s3",
        "cd dist",
        ":zip"
      ]
    }
  ]
}

#
# user-service lambda Function
#
module "lambda-user-service" {
  source = "terraform-aws-modules/lambda/aws"

  function_name = "vinyl-lk-user-service-${terraform.workspace}"
  description   = "user-service"
  handler       = "user-main.main"
  runtime       = "nodejs18.x"
  architectures = ["x86_64"]
  memory_size   = 256
  timeout       = 6
  tags          = var.common-tags
  environment_variables = {
    MONGODB_ATLAS_CLUSTER_URI = local.MONGODB_ATLAS_CLUSTER_URI
    COGNITO_USER_POOL_ID      = aws_cognito_user_pool.vinyl-lk.id
    NODE_OPTIONS              = "--enable-source-maps"
  }
  attach_policy_jsons = true
  policy_jsons = [
    data.aws_iam_policy_document.lambda-s3-full-access.json,
  ]
  number_of_policy_jsons = 1
  source_path = [
    {
      path = "${path.module}/../backend/user-management-service",
      commands = [
        "npm install",
        "./node_modules/.bin/esbuild --sourcemap --bundle user-main.js --outdir=dist --platform=node --target=node18 --preserve-symlinks --external:@aws-sdk/client-s3",
        "cd dist",
        ":zip"
      ]
    }
  ]
}


#
# user-pool-triggers lambda Function
#
module "lambda-user-pool-triggers" {
  source = "terraform-aws-modules/lambda/aws"

  function_name = "vinyl-lk-user-pool-triggers-${terraform.workspace}"
  description   = "user-pool-triggers"
  handler       = "user-pool-triggers.main"
  runtime       = "nodejs18.x"
  architectures = ["x86_64"]
  memory_size   = 128
  timeout       = 6
  tags          = var.common-tags
  environment_variables = {
    MONGODB_ATLAS_CLUSTER_URI = local.MONGODB_ATLAS_CLUSTER_URI
    NODE_OPTIONS              = "--enable-source-maps"
  }
  attach_policy_jsons = true
  policy_jsons = [
    data.aws_iam_policy_document.lambda-user-pool-triggers.json,
  ]
  number_of_policy_jsons = 1
  source_path = [
    {
      path = "${path.module}/../backend/userpool-trigger-service",
      commands = [
        "npm install",
        "./node_modules/.bin/esbuild --sourcemap --bundle user-pool-triggers.js --outdir=dist --platform=node --target=node18 --preserve-symlinks --external:@aws-sdk/client-s3 --external:@aws-sdk/client-cognito-identity-provider",
        "cd dist",
        ":zip"
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
#         "npm install",
#         ":zip"
#       ]
#     }
#   ]
# }
