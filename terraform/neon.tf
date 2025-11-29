# Neon Database Configuration

resource "neon_project" "main" {
  name = "${var.project_name}-${var.environment}"

  # Database configuration
  region_id = var.neon_region

  # Default branch settings
  default_branch_settings = {
    # Connection pooling
    connection_pooling_enabled = true
    
    # Compute settings
    compute_settings = {
      size = "small" # small, medium, large
    }
  }
}

# Neon Branch (for staging/development)
resource "neon_branch" "staging" {
  count       = var.environment == "production" ? 1 : 0
  project_id  = neon_project.main.id
  name        = "staging"
  parent_id   = neon_project.main.default_branch_id
}

# Neon Database
resource "neon_database" "main" {
  project_id = neon_project.main.id
  branch_id  = neon_project.main.default_branch_id
  name       = "neondb"
  owner_name = "neondb_owner"
}

# Neon Role (if needed)
resource "neon_role" "app" {
  project_id = neon_project.main.id
  branch_id  = neon_project.main.default_branch_id
  name       = "app_user"
}

# Variables for Neon
variable "neon_region" {
  description = "Neon region (e.g., aws-us-east-1)"
  type        = string
  default     = "aws-us-east-1"
}

