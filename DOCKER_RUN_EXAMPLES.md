# Docker Run Deployment Examples

This document provides various `docker run` command examples for deploying Fuku in different scenarios.

## Quick Start (SQLite with Defaults)

Simplest way to get started using SQLite database and local file storage.

```bash
docker run -d \
  --name fuku \
  -p 3000:3000 \
  -v $(pwd)/data:/data \
  -e SESSION_SECRET=change_this_to_secure_random_string \
  -e DATABASE_TYPE=sqlite \
  -e DATABASE_PATH=/data/fuku.db \
  -e IMAGE_STORAGE_TYPE=local \
  -e LOCAL_UPLOAD_DIR=/data/uploads \
  -e ALLOW_REGISTRATION=true \
  -e NEXT_PUBLIC_APP_URL=http://localhost:3000 \
  fuku
```

**Parameters explained:**

- `-d`: Run container in detached mode (background)
- `--name fuku`: Name the container
- `-p 3000:3000`: Map host port 3000 to container port 3000
- `-v $(pwd)/data:/data`: Mount current directory's `data` folder to `/data` in container
- `-e SESSION_SECRET`: Required secret for session management
- `-e DATABASE_TYPE=sqlite`: Use SQLite database
- `-e DATABASE_PATH=/data/fuku.db`: SQLite database file location
- `-e IMAGE_STORAGE_TYPE=local`: Use local file storage
- `-e LOCAL_UPLOAD_DIR=/data/uploads`: Upload directory location
- `-e ALLOW_REGISTRATION=true`: Enable user registration
- `-e NEXT_PUBLIC_APP_URL`: Application URL

## Production Deployment

Full production configuration with all environment variables.

```bash
docker run -d \
  --name fuku \
  --restart unless-stopped \
  -p 3000:3000 \
  -v $(pwd)/data:/data \
  -e SESSION_SECRET=your_very_secure_random_string_here \
  -e DATABASE_TYPE=sqlite \
  -e DATABASE_PATH=/data/fuku.db \
  -e IMAGE_STORAGE_TYPE=local \
  -e LOCAL_UPLOAD_DIR=/data/uploads \
  -e ALLOW_REGISTRATION=false \
  -e NEXT_PUBLIC_APP_URL=https://your-domain.com \
  fuku
```

**Additional production parameters:**

- `--restart unless-stopped`: Always restart container unless explicitly stopped
- `-e ALLOW_REGISTRATION=false`: Disable new user registration (production best practice)
- `-e NEXT_PUBLIC_APP_URL`: Set to your actual domain

## External MariaDB

Connect to an external MariaDB database instead of SQLite.

```bash
docker run -d \
  --name fuku \
  -p 3000:3000 \
  -v $(pwd)/data:/data \
  -e SESSION_SECRET=secure_random_string \
  -e DATABASE_TYPE=mariadb \
  -e MARIADB_URL=mysql://fuku_user:secure_password@host.docker.internal:3306/fuku_db \
  -e IMAGE_STORAGE_TYPE=local \
  -e LOCAL_UPLOAD_DIR=/data/uploads \
  -e ALLOW_REGISTRATION=true \
  -e NEXT_PUBLIC_APP_URL=http://localhost:3000 \
  fuku
```

**MariaDB-specific parameters:**

- `-e DATABASE_TYPE=mariadb`: Use MariaDB database
- `-e MARIADB_URL`: Connection string in format `mysql://user:password@host:port/database`

**Note**: Replace `host.docker.internal` with actual MariaDB host if running on different machine.

## Custom Ports

Run the application on a different port.

```bash
docker run -d \
  --name fuku \
  -p 8080:3000 \
  -v $(pwd)/data:/data \
  -e SESSION_SECRET=secure_random_string \
  -e DATABASE_TYPE=sqlite \
  -e DATABASE_PATH=/data/fuku.db \
  -e IMAGE_STORAGE_TYPE=local \
  -e LOCAL_UPLOAD_DIR=/data/uploads \
  -e ALLOW_REGISTRATION=true \
  -e NEXT_PUBLIC_APP_URL=http://localhost:8080 \
  fuku
```

**Custom port parameters:**

- `-p 8080:3000`: Map host port 8080 to container port 3000
- `-e NEXT_PUBLIC_APP_URL=http://localhost:8080`: Update app URL to match custom port

## Background Mode with Restart Policy

Run container in background with automatic restart.

```bash
docker run -d \
  --name fuku \
  --restart unless-stopped \
  -p 3000:3000 \
  -v $(pwd)/data:/data \
  -e SESSION_SECRET=secure_random_string \
  -e DATABASE_TYPE=sqlite \
  -e DATABASE_PATH=/data/fuku.db \
  -e IMAGE_STORAGE_TYPE=local \
  -e LOCAL_UPLOAD_DIR=/data/uploads \
  -e ALLOW_REGISTRATION=true \
  -e NEXT_PUBLIC_APP_URL=http://localhost:3000 \
  fuku
```

**Restart policies:**

- `--restart no`: Don't restart automatically (default)
- `--restart on-failure`: Restart only if container exits with non-zero code
- `--restart unless-stopped`: Restart unless explicitly stopped
- `--restart always`: Always restart, including after system reboot

## S3 Storage

Use AWS S3 or S3-compatible storage for file uploads.

```bash
docker run -d \
  --name fuku \
  -p 3000:3000 \
  -v $(pwd)/data:/data \
  -e SESSION_SECRET=secure_random_string \
  -e DATABASE_TYPE=sqlite \
  -e DATABASE_PATH=/data/fuku.db \
  -e IMAGE_STORAGE_TYPE=s3 \
  -e S3_ACCESS_KEY_ID=your_access_key \
  -e S3_SECRET_ACCESS_KEY=your_secret_key \
  -e S3_BUCKET_NAME=fuku-images \
  -e S3_REGION=us-east-1 \
  -e S3_ENDPOINT=https://s3.amazonaws.com \
  -e S3_PREFIX=uploads/ \
  -e ALLOW_REGISTRATION=true \
  -e NEXT_PUBLIC_APP_URL=http://localhost:3000 \
  fuku
```

**S3-specific parameters:**

- `-e IMAGE_STORAGE_TYPE=s3`: Use S3 storage
- `-e S3_ACCESS_KEY_ID`: AWS access key ID
- `-e S3_SECRET_ACCESS_KEY`: AWS secret access key
- `-e S3_BUCKET_NAME`: S3 bucket name
- `-e S3_REGION`: AWS region
- `-e S3_ENDPOINT`: S3 endpoint (use custom endpoint for S3-compatible services)
- `-e S3_PREFIX`: Prefix for uploaded files

## Using .env File

Mount a .env file instead of passing all variables as flags.

```bash
docker run -d \
  --name fuku \
  -p 3000:3000 \
  -v $(pwd)/data:/data \
  -v $(pwd)/.env:/app/.env:ro \
  fuku
```

**Parameters explained:**

- `-v $(pwd)/.env:/app/.env:ro`: Mount .env file read-only to container

**Note**: Create `.env` file with all required variables before running this command.

## Managing Containers

### View container logs

```bash
docker logs -f fuku
```

### Stop container

```bash
docker stop fuku
```

### Start stopped container

```bash
docker start fuku
```

### Remove container

```bash
docker rm fuku
```

### View container status

```bash
docker ps -a | grep fuku
```

## Troubleshooting

### Container won't start

Check logs for errors:

```bash
docker logs fuku
```

Common issues:

- Missing or incorrect `SESSION_SECRET`
- Incorrect database path or MariaDB connection
- Permission issues with data directory

### Data persistence

Ensure the `/data` directory is properly mounted:

```bash
docker inspect fuku | grep -A 10 Mounts
```

### Database connection issues

For MariaDB, verify the connection string and ensure the database is accessible from the container:

```bash
# Test connection from inside container
docker exec -it fuku sh
ping mariadb-host
```

### Port conflicts

If port 3000 is already in use, either:

1. Stop the conflicting service, or
2. Use a different port mapping (see Custom Ports example)
