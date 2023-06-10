#
# API Gateway
#
resource "aws_api_gateway_rest_api" "vinyl-lk" {
  name        = "vinyl-lk-${terraform.workspace}"
  description = "Vinyl.lk API for ${terraform.workspace} environment"
}

#
# Deployment
#
resource "aws_api_gateway_deployment" "vinyl-lk" {
  rest_api_id = aws_api_gateway_rest_api.vinyl-lk.id

  lifecycle {
    create_before_destroy = true
  }

  stage_description = md5(join("", [
    md5(file("${path.module}/api.tf")),
    md5(file("${path.module}/api-users.tf")),
    md5(file("${path.module}/api-admin.tf")),
    md5(file("${path.module}/api-records.tf")),
    md5(file("${path.module}/api-forum.tf")),
    md5(file("${path.module}/api-market.tf"))
  ]))
}

resource "aws_api_gateway_stage" "vinyl-lk" {
  deployment_id = aws_api_gateway_deployment.vinyl-lk.id
  rest_api_id   = aws_api_gateway_rest_api.vinyl-lk.id
  stage_name    = terraform.workspace
}
