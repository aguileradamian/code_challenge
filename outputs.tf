output "db_hostname" {
  value = aws_db_instance.db.address
}

output "api_url" {
  value = aws_api_gateway_deployment.deploy.invoke_url
}