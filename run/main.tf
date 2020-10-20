provider "aws" {
  access_key = "<ADD YOUR ACCESS KEY HERE>"
  secret_key = "<ADD YOUR SECRET KEY HERE>"
  region     = "ap-northeast-1"
}

module "challenge" {
  source = "../"
}

output "db_hostname" {
  value = module.challenge.db_hostname
}

output "api_url" {
  value = module.challenge.api_url
}