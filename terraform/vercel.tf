# Vercel Project Configuration

resource "vercel_project" "main" {
  name      = var.project_name
  framework = "nextjs"

  # Git repository connection
  git_repository = {
    type = "github"
    repo = var.github_repo
  }

  # Environment variables
  env {
    key    = "NODE_ENV"
    value  = var.environment
    target = ["production", "preview", "development"]
  }

  env {
    key    = "DATABASE_URL"
    value  = neon_project.main.connection_uri
    target = ["production", "preview"]
    type   = "encrypted"
  }

  env {
    key    = "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
    value  = var.clerk_publishable_key
    target = ["production", "preview", "development"]
    type   = "encrypted"
  }

  env {
    key    = "CLERK_SECRET_KEY"
    value  = var.clerk_secret_key
    target = ["production", "preview"]
    type   = "encrypted"
  }

  env {
    key    = "SENTRY_DSN"
    value  = var.sentry_dsn
    target = ["production", "preview"]
    type   = "encrypted"
  }

  env {
    key    = "NEXT_PUBLIC_SENTRY_DSN"
    value  = var.sentry_dsn
    target = ["production", "preview"]
    type   = "encrypted"
  }

  # Build settings
  build_command   = "pnpm build"
  dev_command     = "pnpm dev"
  install_command = "pnpm install"

  # Output directory
  output_directory = ".next"

  # Root directory
  root_directory = "."

  # Ignore build step (optional)
  ignore_command = "git diff --quiet HEAD^ HEAD ./"

  # Serverless function configuration
  serverless_function_region = "iad1" # US East (Washington, D.C.)

  # Team configuration (if using Vercel teams)
  # team_id = var.vercel_team_id
}

# Vercel Domain
resource "vercel_project_domain" "main" {
  project_id = vercel_project.main.id
  domain     = var.domain_name
}

resource "vercel_project_domain" "www" {
  project_id = vercel_project.main.id
  domain     = "www.${var.domain_name}"
}

# Vercel Deploy Hook (for CI/CD)
resource "vercel_deployment" "main" {
  project_id = vercel_project.main.id
  ref        = "main"
  # This is typically managed by Vercel's GitHub integration
}

# Variables for Vercel
variable "github_repo" {
  description = "GitHub repository in format 'owner/repo'"
  type        = string
}

variable "clerk_publishable_key" {
  description = "Clerk publishable key"
  type        = string
  sensitive   = true
}

variable "clerk_secret_key" {
  description = "Clerk secret key"
  type        = string
  sensitive   = true
}

variable "sentry_dsn" {
  description = "Sentry DSN for error tracking"
  type        = string
  sensitive   = true
}

