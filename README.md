# Fuku - Outfit Platform

A personal outfit management platform for tracking clothing items and creating outfit combinations.

## Features

- **User Authentication**: Register, login, and session management
- **Clothing Management**: Add, edit, and categorize clothing items
- **Outfit Creation**: Create and manage outfit combinations
- **Category Organization**: Organize clothing by categories
- **Image Storage**: Support for both S3 cloud storage and local file storage

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: SQLite (better-sqlite3) or MariaDB
- **Authentication**: Custom session-based auth with bcrypt
- **Storage**: AWS S3 (optional) or local filesystem

## Docker Deployment

### Prerequisites

- Docker 20.10+
- Docker Compose 2.0+ (for docker-compose deployment)

### Quick Start with Docker Compose (Recommended)

The easiest way to get started is using Docker Compose:

```bash
# Build and start the application
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the application
docker-compose down
```

The application will be available at [http://localhost:3000](http://localhost:3000).

### Quick Start with Docker Run

Alternatively, use `docker run` directly:

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

### Configuration

#### SQLite (Default)

SQLite database is configured by default with data persisted in the `./data` directory:

```bash
DATABASE_TYPE=sqlite
DATABASE_PATH=/data/fuku.db
```

#### External MariaDB

To use an external MariaDB database:

1. Deploy MariaDB (see below)
2. Create `.env` file or pass environment variables:

```bash
DATABASE_TYPE=mariadb
MARIADB_URL=mysql://fuku_user:secure_password@host.docker.internal:3306/fuku_db
```

#### Setting up External MariaDB

Run MariaDB using Docker:

```bash
docker run -d \
  --name mariadb \
  -e MYSQL_ROOT_PASSWORD=root_password \
  -e MYSQL_DATABASE=fuku_db \
  -e MYSQL_USER=fuku_user \
  -e MYSQL_PASSWORD=secure_password \
  -p 3306:3306 \
  mariadb:latest
```

Or set up MariaDB locally:

1. Install MariaDB
2. Create database: `CREATE DATABASE fuku_db;`
3. Create user: `CREATE USER 'fuku_user'@'localhost' IDENTIFIED BY 'secure_password';`
4. Grant privileges: `GRANT ALL PRIVILEGES ON fuku_db.* TO 'fuku_user'@'localhost';`
5. Flush privileges: `FLUSH PRIVILEGES;`

#### File Storage

**Local Storage** (default):

```bash
IMAGE_STORAGE_TYPE=local
LOCAL_UPLOAD_DIR=/data/uploads
```

**S3 Storage**:

```bash
IMAGE_STORAGE_TYPE=s3
S3_ACCESS_KEY_ID=your_access_key
S3_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET_NAME=fuku-images
S3_REGION=us-east-1
S3_ENDPOINT=https://s3.amazonaws.com
S3_PREFIX=uploads/
```

### Advanced Deployment

For more deployment options and detailed examples, see:

- [DOCKER_RUN_EXAMPLES.md](DOCKER_RUN_EXAMPLES.md) - Various `docker run` scenarios
- [DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md) - Detailed deployment guide

### Data Persistence

All application data is stored in the `./data` directory:

- SQLite database: `./data/fuku.db`
- Local uploads: `./data/uploads`

This directory is mounted into the container, ensuring data persists across container restarts.

### Troubleshooting

#### Container won't start

```bash
# Check logs
docker logs fuku

# Or with docker-compose
docker-compose logs
```

#### Port already in use

Change the port mapping:

```bash
# docker run
-p 8080:3000

# docker-compose (edit docker-compose.yml)
ports:
  - "8080:3000"
```

#### Permission issues

Ensure the `./data` directory exists and has correct permissions:

```bash
mkdir -p data
chmod 755 data
```

#### Database connection errors

For MariaDB, verify:

- Database is running and accessible
- Connection string is correct
- Network allows container to reach database host

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Environment Setup

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Required environment variables:

- `SESSION_SECRET`: Secret key for session management
- `IMAGE_STORAGE_TYPE`: `local` or `s3`
- `ALLOW_REGISTRATION`: Enable/disable new user registration

### Database Configuration

The application supports both SQLite and MariaDB databases.

#### SQLite (Default)

```bash
DATABASE_TYPE=sqlite
DATABASE_PATH=./data/outfit-platform.db
```

#### MariaDB

```bash
DATABASE_TYPE=mariadb
MARIADB_URL=mysql://username:password@host:port/database
```

Example MariaDB URL:

```
MARIADB_URL=mysql://outfit_user:secure_password@localhost:3306/outfit_platform
```

**Setting up MariaDB with Docker:**

```bash
docker run -d \
  --name mariadb \
  -e MYSQL_ROOT_PASSWORD=root_password \
  -e MYSQL_DATABASE=outfit_platform \
  -e MYSQL_USER=outfit_user \
  -e MYSQL_PASSWORD=secure_password \
  -p 3306:3306 \
  mariadb:latest
```

**Setting up MariaDB locally:**

1. Install MariaDB
2. Create a database: `CREATE DATABASE outfit_platform;`
3. Create a user: `CREATE USER 'outfit_user'@'localhost' IDENTIFIED BY 'secure_password';`
4. Grant privileges: `GRANT ALL PRIVILEGES ON outfit_platform.* TO 'outfit_user'@'localhost';`
5. Flush privileges: `FLUSH PRIVILEGES;`

Optional S3 configuration (if using S3 storage):

- `S3_ACCESS_KEY_ID`
- `S3_SECRET_ACCESS_KEY`
- `S3_BUCKET_NAME`
- `S3_REGION`
- `S3_ENDPOINT`
- `S3_CDN_URL`
- `S3_PREFIX`

### Initialize Database

```bash
npm run db:init
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/                 # Next.js app router pages
│   ├── api/            # API routes
│   │   ├── auth/       # Authentication endpoints
│   │   ├── clothing/   # Clothing CRUD
│   │   ├── outfits/    # Outfit management
│   │   └── categories/ # Category management
│   └── page.tsx        # Main application page
├── components/         # React components
├── lib/               # Utility libraries
│   └── auth/          # Authentication logic
└── types/             # TypeScript type definitions
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run db:init` - Initialize database

## License

MIT
