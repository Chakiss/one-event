variable "project_id" {
  description = "GCP Project ID"
  type        = string
  default     = "one-event-production"
}

variable "region" {
  description = "GCP Region"
  type        = string
  default     = "asia-southeast1"
}

variable "zone" {
  description = "GCP Zone"
  type        = string
  default     = "asia-southeast1-a"
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
  default     = "prod"
}

variable "database_tier" {
  description = "Database instance tier"
  type        = string
  default     = "db-f1-micro"
}

variable "database_disk_size" {
  description = "Database disk size in GB"
  type        = number
  default     = 20
}

variable "max_connections" {
  description = "Maximum database connections"
  type        = number
  default     = 100
}
