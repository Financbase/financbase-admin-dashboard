# Financbase Admin Dashboard - Infrastructure as Code
# Terraform configuration for production infrastructure

terraform {
  required_version = ">= 1.5.0"
  
  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = "~> 1.0"
    }
    neon = {
      source  = "kislerdm/neon"
      version = "~> 0.2"
    }
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Backend configuration (use S3, Terraform Cloud, or local)
  backend "s3" {
    # Configure in terraform.tfvars or via environment variables
    # bucket = "financbase-terraform-state"
    # key    = "production/terraform.tfstate"
    # region = "us-east-1"
    # encrypt = true
  }
}

# Provider configurations
provider "vercel" {
  api_token = var.vercel_api_token
}

provider "neon" {
  api_key = var.neon_api_key
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
  # email    = var.cloudflare_email
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = "financbase-admin-dashboard"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

# Variables
variable "environment" {
  description = "Environment name (production, staging, development)"
  type        = string
  default     = "production"
}

variable "vercel_api_token" {
  description = "Vercel API token"
  type        = string
  sensitive   = true
}

variable "neon_api_key" {
  description = "Neon API key"
  type        = string
  sensitive   = true
}

variable "cloudflare_api_token" {
  description = "Cloudflare API token"
  type        = string
  sensitive   = true
}

variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "financbase-admin-dashboard"
}

variable "domain_name" {
  description = "Primary domain name"
  type        = string
  default     = "financbase.com"
}

# Outputs
output "vercel_project_id" {
  description = "Vercel project ID"
  value       = vercel_project.main.id
}

output "neon_project_id" {
  description = "Neon project ID"
  value       = neon_project.main.id
}

output "database_url" {
  description = "Database connection URL"
  value       = neon_project.main.connection_uri
  sensitive   = true
}

