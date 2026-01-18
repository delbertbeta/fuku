# Fuku - Outfit Platform

A personal outfit management platform for tracking clothing items and creating outfit combinations.

## Features

- **Clothing & Outfits**: Manage your wardrobe and create style combinations.
- **Flexible Storage**: Supports local filesystem or AWS S3.
- **Database Support**: Works with SQLite (default) or MariaDB.
- **Auth**: Simple session-based authentication.

## Quick Start (Docker)

The fastest way to deploy is using the official image and a `.env` file.

1. **Prepare Environment**:

   ```bash
   cp .env.example .env
   # Edit .env and set SESSION_SECRET and other configs
   # For Docker, ensure DATABASE_PATH=/data/fuku.db and LOCAL_UPLOAD_DIR=/data/uploads
   ```

2. **Run with Docker**:

   ```bash
   docker run -d \
     --name fuku \
     -p 3000:3000 \
     -v $(pwd)/data:/data \
     -v $(pwd)/.env:/app/.env:ro \
     delbertbeta/fuku:latest
   ```

3. **Docker Compose**:
   ```bash
   docker-compose up -d
   ```

## Local Development

1. **Setup**:

   ```bash
   npm install
   cp .env.example .env
   npm run db:init
   ```

2. **Run**:
   ```bash
   npm run dev
   ```

## Configuration Reference

Refer to `.env.example` for detailed descriptions of all environment variables.

| Variable             | Description           | Default    |
| -------------------- | --------------------- | ---------- |
| `DATABASE_TYPE`      | `sqlite` or `mariadb` | `sqlite`   |
| `IMAGE_STORAGE_TYPE` | `local` or `s3`       | `local`    |
| `SESSION_SECRET`     | Secret for sessions   | (Required) |
| `ALLOW_REGISTRATION` | Enable user signups   | `true`     |

## License

MIT
