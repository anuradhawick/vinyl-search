resource "aws_api_gateway_authorizer" "vinyl-lk-authorizer" {
  name          = "vinyl-lk-authorizer-${terraform.workspace}"
  type          = "COGNITO_USER_POOLS"
  rest_api_id   = aws_api_gateway_rest_api.vinyl-lk.id
  provider_arns = ["arn:aws:cognito-idp:ap-southeast-1:894825156843:userpool/ap-southeast-1_Z23imsu3V"]
}