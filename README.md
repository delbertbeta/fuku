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
