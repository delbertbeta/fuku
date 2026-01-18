# Docker Deployment Guide

This guide provides comprehensive information for deploying Fuku using Docker in production environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Architecture Overview](#architecture-overview)
- [Database Setup](#database-setup)
- [Storage Configuration](#storage-configuration)
- [Production Deployment](#production-deployment)
- [Security Best Practices](#security-best-practices)
- [Performance Tuning](#performance-tuning)
- [Cloud Platform Deployment](#cloud-platform-deployment)
- [Monitoring and Logging](#monitoring-and-logging)
- [Backup and Recovery](#backup-and-recovery)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software

- Docker 20.10 or higher
- Docker Compose 2.0 or higher (for docker-compose deployments)

### System Requirements

- Minimum 512MB RAM
- Minimum 1GB disk space
- Network access for database and S3 (if used)

## Architecture Overview

### Container Structure

The application runs in a single container with:

- **Application**: Next.js 16 application
- **Runtime**: Node.js 20 Alpine
- **User**: Non-root user (uid 1001)
- **Ports**: 3000 (HTTP)

### Data Persistence

Data is persisted through volume mounts:

```
Host              Container
./data          →  /data
./.env          →  /app/.env (read-only)
```

Container data structure:

```
/data
├── fuku.db          # SQLite database (if SQLite)
└── uploads/         # Local file uploads
```

## Database Setup

### SQLite (Default)

SQLite is the default database and requires minimal setup.

**Advantages:**

- Zero configuration
- Automatic migration
- Single file for easy backup

**Limitations:**

- Not suitable for high concurrency
- Single machine deployment

**Configuration:**

```bash
DATABASE_TYPE=sqlite
DATABASE_PATH=/data/fuku.db
```

### MariaDB

MariaDB is recommended for production deployments with multiple users.

**Advantages:**

- Better performance and concurrency
- Suitable for distributed deployments
- Mature ecosystem and tools

**Prerequisites:**

- External MariaDB instance
- Database and user credentials

**Configuration:**

```bash
DATABASE_TYPE=mariadb
MARIADB_URL=mysql://user:password@host:port/database
```

### Setting up External MariaDB

#### Option 1: Docker

```bash
docker run -d \
  --name mariadb \
  -e MYSQL_ROOT_PASSWORD=secure_root_password \
  -e MYSQL_DATABASE=fuku_db \
  -e MYSQL_USER=fuku_user \
  -e MYSQL_PASSWORD=secure_user_password \
  -p 3306:3306 \
  -v mariadb-data:/var/lib/mysql \
  --restart unless-stopped \
  mariadb:latest
```

#### Option 2: Cloud Service

Use a managed MariaDB service:

- AWS RDS
- Google Cloud SQL
- Azure Database for MariaDB
- DigitalOcean Managed Databases

#### Option 3: Self-hosted

1. Install MariaDB on your server
2. Create database:

```sql
CREATE DATABASE fuku_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

3. Create user and grant permissions:

```sql
CREATE USER 'fuku_user'@'%' IDENTIFIED BY 'strong_password';
GRANT ALL PRIVILEGES ON fuku_db.* TO 'fuku_user'@'%';
FLUSH PRIVILEGES;
```

4. Configure firewall to allow connections

#### Connection Security

For production:

- Use strong passwords (minimum 32 characters)
- Enable SSL/TLS connections
- Restrict access to specific IPs
- Use connection pooling
- Monitor connection limits

## Storage Configuration

### Local Storage

Local storage stores files on the host machine.

**Advantages:**

- Simple setup
- No additional cost
- Fast local access

**Limitations:**

- Single machine limitation
- Manual backup required

**Configuration:**

```bash
IMAGE_STORAGE_TYPE=local
LOCAL_UPLOAD_DIR=/data/uploads
```

**Backup Strategy:**

```bash
# Backup uploads
tar -czf uploads-backup-$(date +%Y%m%d).tar.gz ./data/uploads
```

### S3 Storage

S3 storage uses AWS S3 or S3-compatible services.

**Advantages:**

- Scalable and reliable
- Built-in redundancy
- CDN integration possible
- Lifecycle policies for cost optimization

**Configuration:**

```bash
IMAGE_STORAGE_TYPE=s3
S3_ACCESS_KEY_ID=your_access_key
S3_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET_NAME=fuku-images
S3_REGION=us-east-1
S3_ENDPOINT=https://s3.amazonaws.com
S3_PREFIX=uploads/
```

**S3-compatible Services:**

- AWS S3
- MinIO
- DigitalOcean Spaces
- Wasabi
- Backblaze B2

**Best Practices:**

- Use IAM roles instead of access keys when possible
- Enable bucket versioning
- Configure lifecycle rules for old objects
- Use HTTPS endpoints only
- Set appropriate bucket policies

## Production Deployment

### Using Docker Compose

1. **Prepare Environment**

```bash
# Create .env file
cp .env.docker .env

# Edit with your configuration
nano .env
```

2. **Build and Deploy**

```bash
# Build image
docker-compose build

# Start services
docker-compose up -d

# Check status
docker-compose ps
```

3. **Configure Reverse Proxy (Optional but Recommended)**

Use Nginx or Traefik for SSL and load balancing:

**Nginx Example:**

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Using Docker Run

```bash
docker run -d \
  --name fuku \
  --restart unless-stopped \
  -p 3000:3000 \
  -v $(pwd)/data:/data \
  -e SESSION_SECRET=$(openssl rand -base64 32) \
  -e DATABASE_TYPE=mariadb \
  -e MARIADB_URL=mysql://user:pass@db:3306/fuku_db \
  -e IMAGE_STORAGE_TYPE=s3 \
  -e S3_ACCESS_KEY_ID=xxx \
  -e S3_SECRET_ACCESS_KEY=xxx \
  -e S3_BUCKET_NAME=fuku-images \
  -e S3_REGION=us-east-1 \
  -e ALLOW_REGISTRATION=false \
  -e NEXT_PUBLIC_APP_URL=https://your-domain.com \
  fuku
```

### Environment Variables

**Required for Production:**

- `SESSION_SECRET`: Strong random string (use `openssl rand -base64 32`)
- `DATABASE_TYPE`: `sqlite` or `mariadb`
- `DATABASE_PATH` or `MARIADB_URL`: Database configuration
- `NEXT_PUBLIC_APP_URL`: Your production domain

**Recommended for Production:**

- `ALLOW_REGISTRATION=false`: Disable public registration
- `IMAGE_STORAGE_TYPE=s3`: Use S3 for better performance
- Secure database passwords (minimum 32 characters)

## Security Best Practices

### Container Security

1. **Non-root User**: Application runs as non-root user (uid 1001)

2. **Read-only .env Mount**: .env file is mounted read-only

3. **Minimal Base Image**: Uses Alpine Linux for reduced attack surface

4. **Network Isolation**: Use custom Docker networks:

```yaml
networks:
  fuku-network:
    driver: bridge
    internal: false
```

### Secrets Management

**Never commit secrets to Git**

Use one of these methods:

1. **Environment Variables**: Pass secrets as environment variables

2. **Secrets Manager**: Use cloud secrets management:
   - AWS Secrets Manager
   - Azure Key Vault
   - HashiCorp Vault

3. **Docker Secrets** (Swarm mode):

```yaml
services:
  app:
    secrets:
      - session_secret
secrets:
  session_secret:
    file: ./secrets/session_secret.txt
```

### SSL/TLS

**Always use HTTPS in production**

Options:

1. **Reverse Proxy with Let's Encrypt**:

```bash
docker run -d \
  --name nginx-proxy \
  -p 80:80 -p 443:443 \
  -v /path/to/certs:/etc/nginx/certs \
  nginx:alpine
```

2. **Cloud CDN**: Use Cloudflare, AWS CloudFront, etc.

### Access Control

1. **Disable Public Registration**:

```bash
ALLOW_REGISTRATION=false
```

2. **Firewall Rules**: Restrict access to container ports

3. **Rate Limiting**: Configure rate limiting in reverse proxy

## Performance Tuning

### Container Resources

**Limit resource usage:**

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: "2"
          memory: 2G
        reservations:
          cpus: "0.5"
          memory: 512M
```

### Database Optimization

**For SQLite:**

- Enable WAL mode: `.env` set `PRAGMA journal_mode=WAL;`
- Regular vacuum: Periodically run `VACUUM;`
- Enable foreign keys: Ensure enabled in schema

**For MariaDB:**

- Configure connection pool
- Optimize queries with indexes
- Use appropriate storage engine
- Configure cache sizes

### Caching

Enable Next.js caching:

```javascript
// next.config.js
module.exports = {
  output: "standalone",
  compress: true,
  swcMinify: true,
};
```

### Image Optimization

1. **Use S3 CDN**: Configure CDN for S3 bucket

2. **Enable Compression**: Enabled by default in Next.js

3. **Lazy Loading**: Use Next.js Image component

## Cloud Platform Deployment

### AWS ECS

1. **Push Image to ECR**:

```bash
aws ecr create-repository --repository-name fuku

docker build -t fuku .

docker tag fuku:latest <account-id>.dkr.ecr.<region>.amazonaws.com/fuku:latest

aws ecr get-login-password --region <region> | docker login --username AWS --password-stdin <account-id>.dkr.ecr.<region>.amazonaws.com

docker push <account-id>.dkr.ecr.<region>.amazonaws.com/fuku:latest
```

2. **Create Task Definition**:

```json
{
  "family": "fuku",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "containerDefinitions": [
    {
      "name": "fuku",
      "image": "<account-id>.dkr.ecr.<region>.amazonaws.com/fuku:latest",
      "portMappings": [{ "containerPort": 3000 }],
      "environment": [
        { "name": "NODE_ENV", "value": "production" },
        { "name": "PORT", "value": "3000" }
      ],
      "secrets": [
        {
          "name": "SESSION_SECRET",
          "valueFrom": "arn:aws:secretsmanager:region:account-id:secret:session_secret"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/fuku",
          "awslogs-region": "<region>",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

### Google Cloud Run

```bash
# Build and push
gcloud builds submit --tag gcr.io/PROJECT_ID/fuku

# Deploy
gcloud run deploy fuku \
  --image gcr.io/PROJECT_ID/fuku \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars SESSION_SECRET=your_secret \
  --set-env-vars DATABASE_TYPE=mariadb \
  --set-env-vars MARIADB_URL=mysql://user:pass@db:3306/fuku_db
```

### Docker Swarm

```bash
# Deploy stack
docker stack deploy -c docker-compose.yml fuku

# Scale services
docker service scale fuku_app=3
```

## Monitoring and Logging

### Health Checks

Built-in health check monitors `/api/health` endpoint:

```yaml
healthcheck:
  test:
    [
      "CMD",
      "node",
      "-e",
      "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})",
    ]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

### Logging

**View logs:**

```bash
# docker run
docker logs -f fuku

# docker-compose
docker-compose logs -f
```

**Centralized Logging:**

Use services like:

- AWS CloudWatch Logs
- Google Cloud Logging
- ELK Stack
- Datadog

### Monitoring Tools

- **Docker Stats**: `docker stats`
- **cAdvisor**: Container performance metrics
- **Prometheus + Grafana**: Advanced monitoring

## Backup and Recovery

### SQLite Backup

```bash
# Backup database
docker cp fuku:/data/fuku.db ./backups/fuku-$(date +%Y%m%d).db

# Automate with cron
0 2 * * * docker cp fuku:/data/fuku.db ./backups/fuku-$(date +\%Y\%m\%d).db
```

### MariaDB Backup

```bash
# Backup
docker exec mariadb mysqldump -u root -p fuku_db > backup.sql

# Restore
docker exec -i mariadb mysql -u root -p fuku_db < backup.sql
```

### Uploads Backup

```bash
# Backup uploads directory
tar -czf uploads-backup-$(date +%Y%m%d).tar.gz ./data/uploads
```

### Disaster Recovery

1. **Regular Backups**: Schedule automated backups
2. **Offsite Storage**: Store backups in different location
3. **Test Restores**: Regularly test backup restoration
4. **Documentation**: Document recovery procedures

## Troubleshooting

### Container Won't Start

**Check logs:**

```bash
docker logs fuku
```

**Common issues:**

- Missing environment variables
- Incorrect database connection
- Port already in use
- Permission issues with data directory

### Database Connection Errors

**Verify connection:**

```bash
# Test from inside container
docker exec -it fuku sh
ping mariadb-host
```

**Check firewall rules:** Ensure database port is accessible

### Performance Issues

**Check resource usage:**

```bash
docker stats fuku
```

**Optimize:**

- Increase memory limits
- Use S3 instead of local storage
- Enable database caching

### Data Loss

**Check volume mounts:**

```bash
docker inspect fuku | grep -A 10 Mounts
```

**Verify backup:** Check if recent backups exist

### Health Check Failures

**Check health endpoint:**

```bash
curl http://localhost:3000/api/health
```

**Review health check logs:**

```bash
docker inspect fuku | grep -A 20 Health
```
