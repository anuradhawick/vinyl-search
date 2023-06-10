provider "aws" {
  region = var.region
}

locals {
  MONGODB_ATLAS_CLUSTER_URI = terraform.workspace == "prod" ? var.MONGODB_ATLAS_CLUSTER_URI_PROD : var.MONGODB_ATLAS_CLUSTER_URI_DEV
}
