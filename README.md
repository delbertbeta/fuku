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
- **Database**: SQLite (better-sqlite3)
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
- `DATABASE_PATH`: SQLite database file path (default: `./data/outfit-platform.db`)
- `IMAGE_STORAGE_TYPE`: `local` or `s3`
- `ALLOW_REGISTRATION`: Enable/disable new user registration

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
