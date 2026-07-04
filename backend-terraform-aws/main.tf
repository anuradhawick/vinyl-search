provider "aws" {
  region = var.region
}

locals {
  MONGODB_ATLAS_CLUSTER_URI = terraform.workspace == "prod" ? var.MONGODB_ATLAS_CLUSTER_URI_PROD : var.MONGODB_ATLAS_CLUSTER_URI_DEV
  MONGODB_DATABASE_NAME     = "vinyl-lk-${terraform.workspace}"
  common_lambda_hash        = sha256(join("", [for file in sort(fileset("${path.module}/../backend-go/common", "**")) : filesha256("${path.module}/../backend-go/common/${file}")]))

  api_domain_name   = "${terraform.workspace == "prod" ? "" : terraform.workspace}api.vinyl.lk"
  cdn_domain_name   = "${terraform.workspace == "prod" ? "" : terraform.workspace}cdn.vinyl.lk"
  oauth_domain_name = "${terraform.workspace == "prod" ? "auth" : "devauth"}.vinyl.lk"

  frontend_domain_names = terraform.workspace == "prod" ? ["vinyl.lk", "www.vinyl.lk"] : ["${terraform.workspace}.vinyl.lk"]
  frontend_urls         = [for domain_name in local.frontend_domain_names : "https://${domain_name}/"]
  oauth_redirect_urls   = concat(["http://localhost:4200/"], local.frontend_urls)
}
