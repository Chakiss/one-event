output "project_id" {
  description = "GCP Project ID"
  value       = var.project_id
}

output "region" {
  description = "GCP Region"
  value       = var.region
}

output "database_instance_name" {
  description = "Database instance name"
  value       = google_sql_database_instance.main.name
}

output "database_private_ip" {
  description = "Database private IP address"
  value       = google_sql_database_instance.main.private_ip_address
  sensitive   = true
}

output "database_connection_name" {
  description = "Database connection name"
  value       = google_sql_database_instance.main.connection_name
}

output "artifact_registry_url" {
  description = "Artifact Registry URL"
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.main.repository_id}"
}

output "vpc_network_name" {
  description = "VPC network name"
  value       = google_compute_network.main.name
}

output "vpc_subnet_name" {
  description = "VPC subnet name"
  value       = google_compute_subnetwork.main.name
}

output "cloud_run_service_account_email" {
  description = "Cloud Run service account email"
  value       = google_service_account.cloud_run.email
}

output "database_url_secret_name" {
  description = "Database URL secret name"
  value       = google_secret_manager_secret.database_url.secret_id
}

output "jwt_secret_name" {
  description = "JWT secret name"
  value       = google_secret_manager_secret.jwt_secret.secret_id
}
