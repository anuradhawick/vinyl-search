output "api_gateway_url" {
  value = aws_api_gateway_deployment.vinyl-lk.invoke_url
  description = "URL used to invoke the API."
}