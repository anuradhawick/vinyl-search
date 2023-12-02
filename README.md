# Backend

### Terraform Workspaces

Deployments are of two types

* `dev` - use for development deployments
* `prod` - use for production deployments

### Node modules

* Use `npm` for package management
* Exclude `aws-sdk` from esbuilds

# Frontend

Only one form of deployments are performed

* `prod` - for production deployment

Note - frontend shall not be deployed for testing

* Development can take place locally and does not require having a separate cloudfront distribution.

### Node modules

* Use `pnpm` for faster resolutions

# General Practice

* Use `prettier` for formatting code