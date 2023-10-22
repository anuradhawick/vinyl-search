# user pool
resource "aws_cognito_user_pool" "vinyl-lk" {
  name                     = "vinyl-lk-user-pool-${terraform.workspace}"
  auto_verified_attributes = ["email"]

  lambda_config {
    post_confirmation = module.lambda-user-pool-triggers.lambda_function_arn
    pre_sign_up       = module.lambda-user-pool-triggers.lambda_function_arn
  }

  schema {
    name                     = "uid"
    attribute_data_type      = "String"
    developer_only_attribute = false
    mutable                  = true
    required                 = false

    string_attribute_constraints {
      min_length = 0
      max_length = 2048
    }
  }
}

resource "aws_cognito_user_pool_client" "vinyl-lk-client" {
  name         = "vinyl-lk-client-${terraform.workspace}"
  user_pool_id = aws_cognito_user_pool.vinyl-lk.id

  callback_urls                        = ["http://localhost:4200/", "https://vinyl.lk", "https://www.vinyl.lk"]
  logout_urls                          = ["http://localhost:4200/", "https://vinyl.lk", "https://www.vinyl.lk"]
  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_flows                  = ["code"]
  allowed_oauth_scopes                 = ["phone", "email", "profile", "openid", "aws.cognito.signin.user.admin"]
  supported_identity_providers         = ["Facebook", "Google"]
}

# google identity provider
resource "aws_cognito_identity_provider" "vinyl-lk-google-provider" {
  user_pool_id  = aws_cognito_user_pool.vinyl-lk.id
  provider_name = "Google"
  provider_type = "Google"

  provider_details = {
    authorize_scopes = "profile email openid"
    client_id        = var.GOOGLE_CLIENT_ID
    client_secret    = var.GOOGLE_CLIENT_SECRET
    # start
    # not adding the below forces terraform to redeploy changes
    attributes_url                = "https://people.googleapis.com/v1/people/me?personFields="
    attributes_url_add_attributes = "true"
    authorize_url                 = "https://accounts.google.com/o/oauth2/v2/auth"
    oidc_issuer                   = "https://accounts.google.com"
    token_request_method          = "POST"
    token_url                     = "https://www.googleapis.com/oauth2/v4/token"
    # end
  }

  attribute_mapping = {
    birthdate   = "birthdays"
    name        = "name"
    given_name  = "given_name"
    family_name = "family_name"
    email       = "email"
    picture     = "picture"
    username    = "sub"
  }
}

# facebook identity provider
resource "aws_cognito_identity_provider" "vinyl-lk-facebook-provider" {
  user_pool_id  = aws_cognito_user_pool.vinyl-lk.id
  provider_name = "Facebook"
  provider_type = "Facebook"

  provider_details = {
    authorize_scopes = "public_profile,email"
    client_id        = var.FACEBOOK_CLIENT_ID
    client_secret    = var.FACEBOOK_CLIENT_SECRET
    # start
    # not adding the below forces terraform to redeploy changes
    attributes_url                = "https://graph.facebook.com/v17.0/me?fields="
    attributes_url_add_attributes = "true"
    authorize_url                 = "https://www.facebook.com/v17.0/dialog/oauth"
    token_request_method          = "GET"
    token_url                     = "https://graph.facebook.com/v17.0/oauth/access_token"
    # end
  }

  attribute_mapping = {
    birthdate   = "birthday"
    email       = "email"
    family_name = "last_name"
    given_name  = "first_name"
    name        = "name"
    picture     = "picture"
    username    = "id"
  }
}

# identity pool
resource "aws_cognito_identity_pool" "vinyl-lk-idp" {
  identity_pool_name               = "vinyl-lk-idp-${terraform.workspace}"
  allow_unauthenticated_identities = false
  allow_classic_flow               = false

  cognito_identity_providers {
    client_id               = aws_cognito_user_pool_client.vinyl-lk-client.id
    provider_name           = aws_cognito_user_pool.vinyl-lk.endpoint
    server_side_token_check = false
  }

  supported_login_providers = {
    # "graph.facebook.com"  = "7346241598935552"
    "accounts.google.com" = var.GOOGLE_CLIENT_ID
  }

}

# role policy
data "aws_iam_policy_document" "idp-authenticated" {
  statement {
    effect = "Allow"

    principals {
      type        = "Federated"
      identifiers = ["cognito-identity.amazonaws.com"]
    }

    actions = ["sts:AssumeRoleWithWebIdentity"]

    condition {
      test     = "StringEquals"
      variable = "cognito-identity.amazonaws.com:aud"
      values   = [aws_cognito_identity_pool.vinyl-lk-idp.id]
    }

    condition {
      test     = "ForAnyValue:StringLike"
      variable = "cognito-identity.amazonaws.com:amr"
      values   = ["authenticated"]
    }
  }
}

data "aws_iam_policy_document" "idp-unauthenticated" {
  statement {
    effect = "Allow"

    principals {
      type        = "Federated"
      identifiers = ["cognito-identity.amazonaws.com"]
    }

    actions = ["sts:AssumeRoleWithWebIdentity"]

    condition {
      test     = "StringEquals"
      variable = "cognito-identity.amazonaws.com:aud"
      values   = [aws_cognito_identity_pool.vinyl-lk-idp.id]
    }

    condition {
      test     = "ForAnyValue:StringLike"
      variable = "cognito-identity.amazonaws.com:amr"
      values   = ["unauthenticated"]
    }
  }
}

# roles
resource "aws_iam_role" "idp-authenticated" {
  name               = "vinyl-lk-cognito-authenticated-${terraform.workspace}"
  assume_role_policy = data.aws_iam_policy_document.idp-authenticated.json
}

resource "aws_iam_role" "idp-unauthenticated" {
  name               = "vinyl-lk-cognito-unauthenticated-${terraform.workspace}"
  assume_role_policy = data.aws_iam_policy_document.idp-unauthenticated.json
}

# authenticated policy
data "aws_iam_policy_document" "vinyl-lk-authenticated_role_policy" {
  statement {
    effect = "Allow"

    actions = [
      "s3:*",
    ]

    resources = ["*"]
  }
}

# unauthenticated policy
data "aws_iam_policy_document" "vinyl-lk-unauthenticated_role_policy" {
  statement {
    effect = "Deny"

    actions = [
      "s3:*",
    ]

    resources = ["*"]
  }
}

# role policy
resource "aws_iam_role_policy" "idp-authenticated" {
  name   = "vinyl-lk-cognito-authenticated-policy-${terraform.workspace}"
  role   = aws_iam_role.idp-authenticated.id
  policy = data.aws_iam_policy_document.vinyl-lk-authenticated_role_policy.json
}

resource "aws_iam_role_policy" "idp-unauthenticated" {
  name   = "vinyl-lk-cognito-unauthenticated-policy-${terraform.workspace}"
  role   = aws_iam_role.idp-unauthenticated.id
  policy = data.aws_iam_policy_document.vinyl-lk-unauthenticated_role_policy.json
}

# attachment
resource "aws_cognito_identity_pool_roles_attachment" "main" {
  identity_pool_id = aws_cognito_identity_pool.vinyl-lk-idp.id

  roles = {
    "authenticated"   = aws_iam_role.idp-authenticated.arn
    "unauthenticated" = aws_iam_role.idp-unauthenticated.arn
  }
}

# domain config
resource "aws_cognito_user_pool_domain" "vinyl-lk-auth" {
  domain          = "${terraform.workspace == "prod" ? "auth" : "devauth"}.vinyl.lk"
  certificate_arn = var.ACM_CERT
  user_pool_id    = aws_cognito_user_pool.vinyl-lk.id
}

resource "aws_route53_record" "vinyl-lk-auth" {
  name    = aws_cognito_user_pool_domain.vinyl-lk-auth.domain
  type    = "A"
  zone_id = var.R53_ZONE_ID

  alias {
    evaluate_target_health = false
    name                   = aws_cognito_user_pool_domain.vinyl-lk-auth.cloudfront_distribution
    zone_id                = aws_cognito_user_pool_domain.vinyl-lk-auth.cloudfront_distribution_zone_id
  }
}


resource "aws_api_gateway_authorizer" "vinyl-lk-authorizer" {
  name          = "vinyl-lk-authorizer-${terraform.workspace}"
  type          = "COGNITO_USER_POOLS"
  rest_api_id   = aws_api_gateway_rest_api.vinyl-lk.id
  provider_arns = [aws_cognito_user_pool.vinyl-lk.arn]
}

# cognito lambda permissions
resource "aws_lambda_permission" "lambda-user-pool-triggers" {
  statement_id  = "cognito-allow-lambda-user-pool-triggers-${terraform.workspace}"
  action        = "lambda:InvokeFunction"
  function_name = module.lambda-user-pool-triggers.lambda_function_name
  principal     = "cognito-idp.amazonaws.com"
  source_arn    = aws_cognito_user_pool.vinyl-lk.arn
}
