#!/bin/bash

# OneEvent Production Management Script
echo "🎛️  OneEvent Production Management"
echo

case "$1" in
    start)
        echo "🚀 Starting production services..."
        docker compose -f docker-compose.prod.yml up -d
        ;;
    stop)
        echo "🛑 Stopping production services..."
        docker compose -f docker-compose.prod.yml down
        ;;
    restart)
        echo "🔄 Restarting production services..."
        docker compose -f docker-compose.prod.yml down
        docker compose -f docker-compose.prod.yml up -d
        ;;
    logs)
        echo "📋 Showing production logs..."
        docker compose -f docker-compose.prod.yml logs -f
        ;;
    status)
        echo "📊 Production service status:"
        docker compose -f docker-compose.prod.yml ps
        ;;
    rebuild)
        echo "🔨 Rebuilding and restarting..."
        docker compose -f docker-compose.prod.yml down
        docker compose -f docker-compose.prod.yml up --build -d
        ;;
    clean)
        echo "🧹 Cleaning up containers and images..."
        docker compose -f docker-compose.prod.yml down -v
        docker system prune -f
        ;;
    backup-db)
        echo "💾 Backing up database..."
        mkdir -p backups
        docker compose -f docker-compose.prod.yml exec postgres pg_dump -U postgres one_event_production > "backups/db_backup_$(date +%Y%m%d_%H%M%S).sql"
        echo "✅ Database backup completed"
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|logs|status|rebuild|clean|backup-db}"
        echo
        echo "Commands:"
        echo "  start     - Start production services"
        echo "  stop      - Stop production services"
        echo "  restart   - Restart production services"
        echo "  logs      - Show live logs"
        echo "  status    - Show service status"
        echo "  rebuild   - Rebuild and restart all services"
        echo "  clean     - Clean up containers and images"
        echo "  backup-db - Backup production database"
        exit 1
        ;;
esac
