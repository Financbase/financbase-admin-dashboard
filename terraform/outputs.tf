# Outputs

output "infrastructure_summary" {
  description = "Summary of deployed infrastructure"
  value = {
    environment      = var.environment
    project_name     = var.project_name
    vercel_project   = vercel_project.main.name
    neon_project     = neon_project.main.name
    domain           = var.domain_name
    deployment_url   = "https://${var.domain_name}"
  }
}

output "database_connection_info" {
  description = "Database connection information"
  value = {
    project_id     = neon_project.main.id
    branch_id      = neon_project.main.default_branch_id
    database_name  = neon_database.main.name
    # Connection URI is sensitive and should be retrieved separately
  }
  sensitive = false
}

output "vercel_deployment_url" {
  description = "Vercel deployment URL"
  value       = "https://${vercel_project.main.name}.vercel.app"
}

output "monitoring_endpoints" {
  description = "Monitoring and observability endpoints"
  value = {
    cloudwatch_logs = "https://console.aws.amazon.com/cloudwatch/home?region=${var.aws_region}#logsV2:log-groups/log-group/${aws_cloudwatch_log_group.app.name}"
    sns_topic       = aws_sns_topic.alerts.arn
  }
}

