#!/bin/bash

# Terraform Backend Setup Script
# This script helps set up the Terraform backend infrastructure

set -e

echo "🔧 Terraform Backend Setup"
echo "=========================="
echo ""

# Configuration
BACKEND_TYPE=${1:-s3}
AWS_REGION=${AWS_REGION:-us-east-1}
BUCKET_NAME=${TERRAFORM_STATE_BUCKET:-financbase-terraform-state}
DYNAMODB_TABLE=${TERRAFORM_LOCK_TABLE:-terraform-state-lock}

case $BACKEND_TYPE in
  s3)
    echo "Setting up AWS S3 backend..."
    echo ""
    
    # Check if AWS CLI is installed
    if ! command -v aws &> /dev/null; then
      echo "❌ AWS CLI is not installed. Please install it first."
      exit 1
    fi
    
    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
      echo "❌ AWS credentials not configured. Run 'aws configure' first."
      exit 1
    fi
    
    echo "📦 Creating S3 bucket for Terraform state..."
    if aws s3api head-bucket --bucket "$BUCKET_NAME" 2>/dev/null; then
      echo "✅ Bucket $BUCKET_NAME already exists"
    else
      aws s3api create-bucket \
        --bucket "$BUCKET_NAME" \
        --region "$AWS_REGION" \
        --create-bucket-configuration LocationConstraint="$AWS_REGION"
      
      # Enable versioning
      aws s3api put-bucket-versioning \
        --bucket "$BUCKET_NAME" \
        --versioning-configuration Status=Enabled
      
      # Enable encryption
      aws s3api put-bucket-encryption \
        --bucket "$BUCKET_NAME" \
        --server-side-encryption-configuration '{
          "Rules": [{
            "ApplyServerSideEncryptionByDefault": {
              "SSEAlgorithm": "AES256"
            }
          }]
        }'
      
      # Block public access
      aws s3api put-public-access-block \
        --bucket "$BUCKET_NAME" \
        --public-access-block-configuration \
        "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
      
      echo "✅ Bucket $BUCKET_NAME created and configured"
    fi
    
    echo ""
    echo "🔒 Creating DynamoDB table for state locking..."
    if aws dynamodb describe-table --table-name "$DYNAMODB_TABLE" &> /dev/null; then
      echo "✅ Table $DYNAMODB_TABLE already exists"
    else
      aws dynamodb create-table \
        --table-name "$DYNAMODB_TABLE" \
        --attribute-definitions AttributeName=LockID,AttributeType=S \
        --key-schema AttributeName=LockID,KeyType=HASH \
        --billing-mode PAY_PER_REQUEST \
        --region "$AWS_REGION"
      
      echo "✅ Table $DYNAMODB_TABLE created"
    fi
    
    echo ""
    echo "📝 Creating backend.tf file..."
    cat > backend.tf <<EOF
terraform {
  backend "s3" {
    bucket         = "$BUCKET_NAME"
    key            = "production/terraform.tfstate"
    region         = "$AWS_REGION"
    encrypt        = true
    dynamodb_table = "$DYNAMODB_TABLE"
  }
}
EOF
    
    echo "✅ Backend configuration created in backend.tf"
    echo ""
    echo "📋 Next steps:"
    echo "1. Review backend.tf"
    echo "2. Run: terraform init"
    echo "3. Run: terraform plan"
    ;;
    
  terraform-cloud)
    echo "Setting up Terraform Cloud backend..."
    echo ""
    echo "Please configure Terraform Cloud manually:"
    echo "1. Create organization at https://app.terraform.io"
    echo "2. Create workspace"
    echo "3. Copy backend configuration from backend.tf.example"
    echo ""
    ;;
    
  *)
    echo "❌ Unknown backend type: $BACKEND_TYPE"
    echo "Supported types: s3, terraform-cloud"
    exit 1
    ;;
esac

echo ""
echo "✅ Backend setup complete!"

