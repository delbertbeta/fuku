# Design: Establish Outfit Platform

## Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────────────┐
│                Frontend Layer                    │
│  ┌─────────────┐  ┌─────────────┐              │
│  │  Mobile UI  │  │  Desktop UI │              │
│  └─────────────┘  └─────────────┘              │
│         ↓                 ↓                      │
│    ┌──────────────────────────────┐             │
│    │  Next.js App Router           │             │
│    │  - Page Routes                │             │
│    │  - API Routes                 │             │
│    │  - Server Actions             │             │
│    └──────────────────────────────┘             │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│               Business Logic Layer              │
│  ┌─────────────┐  ┌─────────────┐              │
│  │  Auth       │  │  Domain     │              │
│  │  Service    │  │  Services   │              │
│  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│                 Data Layer                       │
│  ┌─────────────┐  ┌─────────────┐              │
│  │  SQLite DB  │  │  S3 Storage │              │
│  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────┘
```

### Technology Rationale

#### Next.js (Latest) with App Router

- **Why**: Server-side rendering for better performance, built-in API routes for backend logic, App Router for modern routing patterns
- **Trade-off**: Learning curve for Server Components, but provides better UX

#### TypeScript

- **Why**: Type safety for complex domain models (clothing, outfits), better developer experience
- **Trade-off**: Initial setup complexity, but prevents runtime errors

#### Rsbuild

- **Why**: Fast build times compared to webpack, minimal configuration, modern tooling
- **Trade-off**: Younger ecosystem than webpack, but actively maintained

#### SQLite

- **Why**: Zero configuration, file-based storage, sufficient for personal/single-tenant use, easy backup
- **Trade-off**: No built-in replication, not suitable for high-concurrency production

## Database Schema

### Tables

#### users

```sql
id INTEGER PRIMARY KEY AUTOINCREMENT
email TEXT UNIQUE NOT NULL
password_hash TEXT NOT NULL
created_at DATETIME DEFAULT CURRENT_TIMESTAMP
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
```

#### sessions

```sql
id TEXT PRIMARY KEY
user_id INTEGER NOT NULL REFERENCES users(id)
expires_at DATETIME NOT NULL
created_at DATETIME DEFAULT CURRENT_TIMESTAMP
```

#### clothing_items

```sql
id INTEGER PRIMARY KEY AUTOINCREMENT
user_id INTEGER NOT NULL REFERENCES users(id)
category TEXT NOT NULL -- 'top', 'jacket', 'pants', 'shoes'
name TEXT NOT NULL
description TEXT
image_path TEXT NOT NULL
price DECIMAL(10, 2)
purchase_date DATE
created_at DATETIME DEFAULT CURRENT_TIMESTAMP
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
UNIQUE(user_id, name) -- Prevent duplicate clothing names per user
```

#### outfits

```sql
id INTEGER PRIMARY KEY AUTOINCREMENT
user_id INTEGER NOT NULL REFERENCES users(id)
name TEXT NOT NULL
description TEXT
created_at DATETIME DEFAULT CURRENT_TIMESTAMP
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
```

#### outfit_items

```sql
outfit_id INTEGER NOT NULL REFERENCES outfits(id)
clothing_id INTEGER NOT NULL REFERENCES clothing_items(id)
PRIMARY KEY (outfit_id, clothing_id)
```

## API Design

### Authentication Endpoints

- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Authenticate and create session
- `POST /api/auth/logout` - Destroy session

### Clothing Endpoints

- `GET /api/clothing` - List user's clothing (with filters)
- `POST /api/clothing` - Create clothing item
- `GET /api/clothing/[id]` - Get single clothing item
- `PUT /api/clothing/[id]` - Update clothing item
- `DELETE /api/clothing/[id]` - Delete clothing item

### Outfit Endpoints

- `GET /api/outfits` - List user's outfits
- `POST /api/outfits` - Create outfit
- `GET /api/outfits/[id]` - Get outfit with item details
- `PUT /api/outfits/[id]` - Update outfit
- `DELETE /api/outfits/[id]` - Delete outfit

### Image Upload

- `POST /api/upload` - Upload image file, return path

## Page Structure

### Tab Navigation

Mobile: Bottom tab bar
Desktop: Top navigation bar

### Routes

#### Authentication

- `/login` - Login form
- `/register` - Registration form

#### Clothing Tab

- `/clothing` - List view with filters
- `/clothing/new` - Create clothing form
- `/clothing/[id]` - Detail view

#### Outfit Tab

- `/outfits` - List view
- `/outfits/new` - Create outfit (select clothing items)
- `/outfits/[id]` - Detail view with breakdown

## State Management

### Client State

- React Context for user session
- URL params for filtering (e.g., category filter)
- Server Actions for mutations

### Server State

- SQLite for persistent data
- HTTP-only cookies for session tokens
- S3 storage for image storage

## Security Considerations

### Password Security

- Use bcrypt or argon2 for password hashing
- Minimum password length enforcement
- Rate limiting on auth endpoints

### Session Security

- HTTP-only, secure cookies
- Expiring session tokens
- CSRF protection via Next.js built-in middleware

### Input Validation

- Server-side validation on all inputs
- Zod schema validation
- File upload size and type restrictions

### Data Isolation

- All queries scoped to authenticated user
- Row-level security via user_id foreign keys
- No direct database access from client

## Performance Considerations

### Image Optimization

- Server-side compression after upload (max 1MB, max dimension 1920px)
- Generate thumbnails for list views
- Lazy loading in lists
- Next.js Image component for optimization

### Database Optimization

- Indexes on foreign keys and query columns
- Prepared statements for all queries
- Connection pooling via better-sqlite3

### Caching

- Static image serving via Next.js public directory
- Route caching where appropriate
- Optimistic UI updates

## Responsive Design Strategy

### Breakpoints

- Mobile: < 640px (default)
- Tablet: 640px - 1024px
- Desktop: > 1024px

### Layout Adaptations

- **Mobile**: Single column, bottom navigation, vertical lists, full-width forms
- **Desktop**: Multi-column grids, top navigation, card-based layouts, optimized form layouts

### Touch vs Mouse

- Larger touch targets (min 44px) on mobile
- Hover effects on desktop
- Swipe gestures for mobile navigation (optional)

## File Organization

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (tabs)/
│   │   ├── clothing/
│   │   └── outfits/
│   └── layout.tsx
├── components/
│   ├── clothing/
│   ├── outfits/
│   ├── auth/
│   └── ui/
├── lib/
│   ├── db/
│   ├── auth/
│   └── utils/
├── public/
│   └── uploads/
└── types/
```

## Deployment Considerations

### Development

- Local SQLite file
- Hot reload via Next.js dev server
- S3 storage (or local fallback for development)

### Production

- Persistent volume for SQLite file
- Regular backups configured
- S3 storage configured via environment variables
- Environment variables for secrets

## Environment Variables

### S3 Storage Configuration

Required environment variables for S3 integration:

```
S3_ACCESS_KEY_ID=your_access_key
S3_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET_NAME=outfit-platform-images
S3_REGION=us-east-1
S3_ENDPOINT=https://s3.amazonaws.com  # Optional for S3-compatible services
```

Optional environment variables:

```
S3_CDN_URL=https://cdn.example.com  # CDN URL for serving images
S3_PREFIX=uploads/  # Prefix for all uploaded files
```

### Fallback Configuration

For development without S3, the application can use local file storage:

```
IMAGE_STORAGE_TYPE=local  # 's3' or 'local'
LOCAL_UPLOAD_DIR=./public/uploads
```

## Future Extensibility

### Database Migration Strategy

- Use migration files (e.g., drizzle-kit or prisma)
- Version control schema changes
- Backup before migrations

### Plugin Architecture

- Modular clothing categories (easy to add new types)
- Pluggable auth providers (future OAuth)
- Extensible metadata schema

## Monitoring & Observability

### Logging

- Structured logging for API errors
- User action tracking (audit log)
- Performance metrics

### Error Handling

- Global error boundary
- User-friendly error messages
- Server-side error logging

## Backup & Recovery

### Data Backup

- Periodic SQLite file dumps
- S3 backup via versioning and lifecycle policies
- Export functionality for users

### Recovery

- Restore from backup file
- Data integrity checks
- Rollback capability
