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

variable "ACM_CERT" {
  type = string
}

variable "R53_ZONE_ID" {
  type = string
}

# External environment variables
variable "MONGODB_ATLAS_CLUSTER_URI_DEV" {
  type = string
}

variable "MONGODB_ATLAS_CLUSTER_URI_PROD" {
  type = string
}

variable "GOOGLE_CLIENT_ID" {
  type = string
}

variable "GOOGLE_CLIENT_SECRET" {
  type = string
}

variable "FACEBOOK_CLIENT_ID" {
  type = string
}

variable "FACEBOOK_CLIENT_SECRET" {
  type = string
}
