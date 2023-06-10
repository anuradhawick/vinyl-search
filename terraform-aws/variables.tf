# AWS variables

variable "region" {
  default = "ap-southeast-1"
  type    = string
}

variable "common-tags" {
  default = {
    NAME = "VINYL.LK"
  }
}

# External environment variables
variable "MONGODB_ATLAS_CLUSTER_URI_DEV" {
  type = string
}

variable "MONGODB_ATLAS_CLUSTER_URI_PROD" {
  type = string
}
