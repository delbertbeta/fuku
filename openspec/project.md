# Project Context

## Purpose

A personal outfit management platform for tracking clothing items and creating outfit combinations. Users can register, manage their wardrobe, categorize clothing items, and create outfit combinations from their collection.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 4
- **Database**: SQLite (better-sqlite3)
- **Authentication**: Custom session-based auth with bcrypt
- **Storage**: AWS S3 (optional) or local filesystem
- **Image Processing**: Sharp

## Project Conventions

### Code Style

- **Linting**: ESLint with Next.js core web vitals and TypeScript rules
- **Formatting**: Prettier with semicolons, trailing commas (es5), double quotes, 80 character line width, 2-space indentation
- **TypeScript**: Strict mode enabled
- **Import Path**: `@/*` alias for `./src/*`

### Architecture Patterns

- **App Router**: Next.js 16 App Router for routing and server components
- **API Routes**: RESTful API endpoints in `src/app/api/`
- **Database Layer**: SQLite with better-sqlite3 in `src/lib/db/`
- **Storage Abstraction**: Unified storage interface supporting both S3 and local storage in `src/lib/storage/`
- **Authentication**: Session-based authentication with middleware protection
- **Validation**: Zod for schema validation

### Testing Strategy

Currently no automated testing is configured. Testing should be considered for future development.

### Git Workflow

- **Commit Messages**: English, single-line, Conventional Commits format (e.g., `feat: add user registration`)
- **Commit Constraints**: Maximum 80 characters, no scope prefix required
- See AGENTS.md for detailed guidelines

## Domain Context

### Core Entities

- **Users**: Platform users with authentication
- **Clothing Categories**: User-defined categories (e.g., 上装, 外套, 下装, 鞋子, 未分类) with system and user-created categories
- **Clothing Items**: Individual clothing pieces with name, description, image, price, purchase date
- **Outfits**: Named combinations of clothing items
- **Outfit Items**: Many-to-many relationship between outfits and clothing items

### Data Relationships

- Users own their own clothing categories, items, and outfits (cascading delete)
- Sessions are linked to users with expiration
- Clothing items belong to categories
- Outfits contain multiple clothing items

## Important Constraints

- User data isolation: Each user only sees their own data
- Session-based authentication required for all non-public routes
- Image storage must handle both local and S3 backends
- Database migrations are handled manually in schema initialization
- Registration can be toggled on/off via `ALLOW_REGISTRATION` env var

## External Dependencies

- **AWS S3** (optional): For image storage when `IMAGE_STORAGE_TYPE=s3`
- **Environment Variables**: Required configuration for session secret, database path, storage type
