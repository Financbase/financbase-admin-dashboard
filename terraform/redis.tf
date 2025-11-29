# Redis Cache Configuration (Optional)
# Using AWS ElastiCache as example, can be adapted for other providers

resource "aws_elasticache_subnet_group" "main" {
  name       = "${var.project_name}-redis-subnet"
  subnet_ids = var.aws_subnet_ids

  tags = {
    Name = "${var.project_name}-redis-subnet-group"
  }
}

resource "aws_security_group" "redis" {
  name        = "${var.project_name}-redis-sg"
  description = "Security group for Redis cache"
  vpc_id      = var.aws_vpc_id

  ingress {
    description = "Redis from VPC"
    from_port   = 6379
    to_port       = 6379
    protocol     = "tcp"
    cidr_blocks  = [var.aws_vpc_cidr]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-redis-security-group"
  }
}

resource "aws_elasticache_replication_group" "main" {
  replication_group_id       = "${var.project_name}-redis-${var.environment}"
  description                = "Redis cache for ${var.project_name}"
  
  # Engine configuration
  engine                     = "redis"
  engine_version             = "7.0"
  node_type                  = var.redis_node_type
  port                       = 6379
  parameter_group_name       = "default.redis7"
  
  # Cluster configuration
  num_cache_clusters          = var.redis_num_nodes
  
  # Network configuration
  subnet_group_name          = aws_elasticache_subnet_group.main.name
  security_group_ids         = [aws_security_group.redis.id]
  
  # High availability
  automatic_failover_enabled = true
  multi_az_enabled          = var.environment == "production"
  
  # Backup configuration
  snapshot_retention_limit   = var.environment == "production" ? 7 : 1
  snapshot_window           = "03:00-05:00"
  
  # Maintenance
  maintenance_window        = "sun:05:00-sun:07:00"
  
  # Tags
  tags = {
    Name = "${var.project_name}-redis"
  }
}

# Variables for Redis
variable "aws_vpc_id" {
  description = "AWS VPC ID"
  type        = string
  default     = ""
}

variable "aws_vpc_cidr" {
  description = "AWS VPC CIDR block"
  type        = string
  default     = "10.0.0.0/16"
}

variable "aws_subnet_ids" {
  description = "AWS subnet IDs for Redis"
  type        = list(string)
  default     = []
}

variable "redis_node_type" {
  description = "Redis node type"
  type        = string
  default     = "cache.t3.micro"
}

variable "redis_num_nodes" {
  description = "Number of Redis nodes"
  type        = number
  default     = 2
}

# Outputs
output "redis_endpoint" {
  description = "Redis primary endpoint"
  value       = aws_elasticache_replication_group.main.primary_endpoint_address
  sensitive   = true
}

output "redis_port" {
  description = "Redis port"
  value       = aws_elasticache_replication_group.main.port
}

