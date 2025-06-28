# Enable required APIs
resource "google_project_service" "services" {
  for_each = toset([
    "cloudbuild.googleapis.com",
    "run.googleapis.com",
    "sql-component.googleapis.com",
    "sqladmin.googleapis.com",
    "compute.googleapis.com",
    "container.googleapis.com",
    "artifactregistry.googleapis.com",
    "secretmanager.googleapis.com",
    "cloudresourcemanager.googleapis.com",
    "iam.googleapis.com"
  ])

  service            = each.value
  disable_on_destroy = false
}

# Artifact Registry
resource "google_artifact_registry_repository" "main" {
  location      = var.region
  repository_id = "one-event-repo"
  description   = "OneEvent application images"
  format        = "DOCKER"

  depends_on = [google_project_service.services]
}

# VPC Network
resource "google_compute_network" "main" {
  name                    = "one-event-network"
  auto_create_subnetworks = false

  depends_on = [google_project_service.services]
}

# Subnet
resource "google_compute_subnetwork" "main" {
  name          = "one-event-subnet"
  ip_cidr_range = "10.0.0.0/24"
  region        = var.region
  network       = google_compute_network.main.id

  private_ip_google_access = true
}

# Cloud NAT Router
resource "google_compute_router" "router" {
  name    = "one-event-router"
  region  = var.region
  network = google_compute_network.main.id
}

# Cloud NAT
resource "google_compute_router_nat" "nat" {
  name                               = "one-event-nat"
  router                            = google_compute_router.router.name
  region                            = var.region
  nat_ip_allocate_option            = "AUTO_ONLY"
  source_subnetwork_ip_ranges_to_nat = "ALL_SUBNETWORKS_ALL_IP_RANGES"

  log_config {
    enable = true
    filter = "ERRORS_ONLY"
  }
}

# PostgreSQL Database
resource "google_sql_database_instance" "main" {
  name             = "one-event-db-${var.environment}"
  database_version = "POSTGRES_15"
  region          = var.region

  settings {
    tier              = var.database_tier
    availability_type = var.environment == "prod" ? "REGIONAL" : "ZONAL"
    disk_size         = var.database_disk_size
    disk_type         = "PD_SSD"
    disk_autoresize   = true

    backup_configuration {
      enabled                        = true
      start_time                     = "03:00"
      point_in_time_recovery_enabled = var.environment == "prod"
      transaction_log_retention_days = 7
      backup_retention_settings {
        retained_backups = 7
      }
    }

    ip_configuration {
      ipv4_enabled                                  = false
      private_network                               = google_compute_network.main.id
      enable_private_path_for_google_cloud_services = true
    }

    database_flags {
      name  = "max_connections"
      value = var.max_connections
    }

    maintenance_window {
      day          = 7  # Sunday
      hour         = 3  # 3 AM
      update_track = "stable"
    }
  }

  deletion_protection = var.environment == "prod"

  depends_on = [
    google_project_service.services,
    google_service_networking_connection.private_vpc_connection
  ]
}

# Database
resource "google_sql_database" "main" {
  name     = "one_event_${var.environment}"
  instance = google_sql_database_instance.main.name
}

# Database User
resource "google_sql_user" "main" {
  name     = "one_event_user"
  instance = google_sql_database_instance.main.name
  password = random_password.db_password.result
}

# Random password for database
resource "random_password" "db_password" {
  length  = 32
  special = true
}

# Private VPC connection for Cloud SQL
resource "google_compute_global_address" "private_ip_address" {
  name          = "private-ip-address"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = google_compute_network.main.id

  depends_on = [google_project_service.services]
}

resource "google_service_networking_connection" "private_vpc_connection" {
  network                 = google_compute_network.main.id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_ip_address.name]

  depends_on = [google_project_service.services]
}

# Secrets
resource "google_secret_manager_secret" "database_url" {
  secret_id = "one-event-db-url-${var.environment}"

  replication {
    auto {}
  }

  depends_on = [google_project_service.services]
}

resource "google_secret_manager_secret_version" "database_url" {
  secret = google_secret_manager_secret.database_url.id
  secret_data = "postgresql://${google_sql_user.main.name}:${random_password.db_password.result}@${google_sql_database_instance.main.private_ip_address}:5432/${google_sql_database.main.name}"
}

resource "google_secret_manager_secret" "jwt_secret" {
  secret_id = "one-event-jwt-secret-${var.environment}"

  replication {
    auto {}
  }

  depends_on = [google_project_service.services]
}

resource "google_secret_manager_secret_version" "jwt_secret" {
  secret = google_secret_manager_secret.jwt_secret.id
  secret_data = random_password.jwt_secret.result
}

resource "random_password" "jwt_secret" {
  length  = 64
  special = true
}

# Service Account for Cloud Run
resource "google_service_account" "cloud_run" {
  account_id   = "one-event-cloud-run-${var.environment}"
  display_name = "OneEvent Cloud Run Service Account"
  description  = "Service account for OneEvent Cloud Run services"
}

# IAM bindings for Cloud Run service account
resource "google_project_iam_member" "cloud_run_sql_client" {
  project = var.project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${google_service_account.cloud_run.email}"
}

resource "google_secret_manager_secret_iam_member" "database_url_accessor" {
  secret_id = google_secret_manager_secret.database_url.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.cloud_run.email}"
}

resource "google_secret_manager_secret_iam_member" "jwt_secret_accessor" {
  secret_id = google_secret_manager_secret.jwt_secret.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.cloud_run.email}"
}
