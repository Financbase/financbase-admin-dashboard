# Infrastructure as Code - Terraform

This directory contains Terraform configurations for managing the Financbase Admin Dashboard infrastructure.

## Overview

The Terraform configuration manages:
- **Vercel**: Application hosting and deployment
- **Neon**: PostgreSQL database
- **AWS**: Redis cache, monitoring, and supporting services
- **Cloudflare**: DNS and CDN (optional)

## Prerequisites

1. **Terraform** >= 1.5.0
   ```bash
   brew install terraform  # macOS
   # or download from https://www.terraform.io/downloads
   ```

2. **Provider Credentials**:
   - Vercel API token
   - Neon API key
   - AWS credentials (if using AWS resources)
   - Cloudflare API token (optional)

3. **Backend Configuration**:
   - S3 bucket for state storage (recommended)
   - Or use Terraform Cloud

## Setup

1. **Copy example variables**:
   ```bash
   cp terraform.tfvars.example terraform.tfvars
   ```

2. **Configure variables**:
   Edit `terraform.tfvars` with your actual values.

3. **Configure backend** (optional):
   Edit `main.tf` backend configuration or use Terraform Cloud.

4. **Initialize Terraform**:
   ```bash
   cd terraform
   terraform init
   ```

5. **Plan changes**:
   ```bash
   terraform plan
   ```

6. **Apply configuration**:
   ```bash
   terraform apply
   ```

## Structure

```
terraform/
├── main.tf              # Main configuration and providers
├── vercel.tf            # Vercel project and deployment
├── neon.tf              # Neon database configuration
├── redis.tf             # Redis cache (optional)
├── monitoring.tf        # Monitoring and alerting
├── variables.tf         # Variable definitions
├── outputs.tf           # Output values
├── terraform.tfvars.example  # Example variables
└── README.md            # This file
```

## Environments

### Production
```bash
terraform workspace select production
terraform apply -var-file=production.tfvars
```

### Staging
```bash
terraform workspace new staging
terraform apply -var-file=staging.tfvars
```

### Development
```bash
terraform workspace new development
terraform apply -var-file=development.tfvars
```

## State Management

### Remote State (Recommended)

Configure S3 backend in `main.tf`:
```hcl
backend "s3" {
  bucket = "financbase-terraform-state"
  key    = "production/terraform.tfstate"
  region = "us-east-1"
  encrypt = true
}
```

### State Locking

Use DynamoDB for state locking:
```bash
aws dynamodb create-table \
  --table-name terraform-state-lock \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST
```

## Security Best Practices

1. **Never commit `terraform.tfvars`** - Add to `.gitignore`
2. **Use remote state** - Store state in S3 or Terraform Cloud
3. **Enable state encryption** - Encrypt state at rest
4. **Use secrets management** - Consider AWS Secrets Manager or HashiCorp Vault
5. **Limit provider permissions** - Use least privilege IAM roles

## Common Commands

```bash
# Initialize
terraform init

# Validate configuration
terraform validate

# Format code
terraform fmt

# Plan changes
terraform plan

# Apply changes
terraform apply

# Destroy infrastructure
terraform destroy

# Show current state
terraform show

# List resources
terraform state list

# Import existing resource
terraform import <resource_type>.<name> <resource_id>

# Refresh state
terraform refresh
```

## Outputs

After applying, view outputs:
```bash
terraform output
```

Key outputs:
- `vercel_project_id`: Vercel project ID
- `neon_project_id`: Neon project ID
- `database_connection_info`: Database connection details
- `vercel_deployment_url`: Deployment URL

## Troubleshooting

### Provider Authentication Issues

**Vercel**:
```bash
export VERCEL_API_TOKEN="your-token"
```

**Neon**:
```bash
export NEON_API_KEY="your-key"
```

**AWS**:
```bash
aws configure
# or
export AWS_ACCESS_KEY_ID="..."
export AWS_SECRET_ACCESS_KEY="..."
```

### State Lock Issues

If state is locked:
```bash
terraform force-unlock <LOCK_ID>
```

## CI/CD Integration

### GitHub Actions

Add to `.github/workflows/terraform.yml`:
```yaml
- name: Terraform Apply
  run: |
    cd terraform
    terraform init
    terraform plan
    terraform apply -auto-approve
```

### Manual Deployment

1. Make infrastructure changes
2. Run `terraform plan` to review
3. Get approval
4. Run `terraform apply`
5. Verify deployment

## Cost Estimation

Before applying, estimate costs:
```bash
terraform plan -out=tfplan
terraform show -json tfplan | jq '.planned_values.root_module.resources[] | select(.type | contains("aws"))'
```

## Support

For issues or questions:
- Check Terraform documentation: https://www.terraform.io/docs
- Review provider documentation
- Contact DevOps team

## Version History

- **v1.0.0** (2025-01): Initial Terraform configuration

