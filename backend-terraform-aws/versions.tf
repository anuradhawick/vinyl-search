terraform {
  required_version = ">= 1.15.1"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 6.43.0, < 7.0.0"
    }

    archive = {
      source  = "hashicorp/archive"
      version = ">= 2.7.1, < 3.0.0"
    }

    local = {
      source  = "hashicorp/local"
      version = ">= 2.8.0, < 3.0.0"
    }

    null = {
      source  = "hashicorp/null"
      version = ">= 3.2.4, < 4.0.0"
    }

    external = {
      source  = "hashicorp/external"
      version = ">= 2.3.5, < 3.0.0"
    }
  }
}
