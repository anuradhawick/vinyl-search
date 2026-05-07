terraform {
  required_version = ">= 1.10.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 6.43.0, < 7.0.0"
    }

    external = {
      source  = "hashicorp/external"
      version = ">= 2.3.5, < 3.0.0"
    }
  }
}
