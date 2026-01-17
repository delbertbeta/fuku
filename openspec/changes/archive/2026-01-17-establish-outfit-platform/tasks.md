# Tasks: Establish Outfit Platform

## Phase 1: Project Setup

- [x] **Initialize Next.js project with TypeScript and Rsbuild**
  - Install Next.js (latest) with TypeScript
  - Configure Rsbuild as bundler
  - Set up basic project structure
  - Verify build and dev server work

- [x] **Configure development environment**
  - Set up ESLint and Prettier
  - Configure TypeScript strict mode
  - Create .env.example for environment variables
  - Set up Git ignore patterns

- [x] **Set up SQLite database**
  - Install better-sqlite3 or similar SQLite library
  - Create database initialization script
  - Set up schema migration system
  - Create connection utility

## Phase 2: Authentication System

- [x] **Design and implement database schema for auth**
  - Create users table with email, password_hash
  - Create sessions table for session management
  - Add necessary indexes
  - Write migration

- [x] **Implement password hashing and validation**
  - Integrate bcrypt/argon2 for password hashing
  - Create password validation utility
  - Add minimum password length constraint
  - Write unit tests

- [x] **Create auth API routes**
  - POST /api/auth/register endpoint
  - POST /api/auth/login endpoint
  - POST /api/auth/logout endpoint
  - Add input validation with Zod

- [x] **Implement session management**
  - Create session creation utility
  - Set HTTP-only, secure cookies
  - Implement session expiration
  - Add session validation middleware

- [x] **Build auth UI components**
  - Login page with form
  - Register page with form
  - Form validation and error display
  - Redirect after successful auth

- [ ] **Add rate limiting to auth endpoints**
  - Implement rate limiting middleware
  - Configure limits for register/login
  - Add logging for blocked attempts

## Phase 3: Clothing Management

- [x] **Design and implement database schema for clothing**
  - Create clothing_items table
  - Add foreign key to users table
  - Add constraints (category required, name unique per user)
  - Write migration

- [x] **Implement image upload system with S3 storage**
  - Create upload API endpoint
  - Configure S3 storage with environment variables
  - Add file validation (type: JPEG/PNG/WebP, max 10MB)
  - Implement server-side image compression (max 1MB, max 1920px)
  - Add S3 client configuration and fallback to local storage
  - Create .env.example with S3 configuration template

- [x] **Create clothing API routes**
  - GET /api/clothing with filtering (by category)
  - POST /api/clothing with image upload
  - GET /api/clothing/[id]
  - PUT /api/clothing/[id]
  - DELETE /api/clothing/[id]
  - Add Zod validation for all endpoints

- [x] **Build clothing UI components**
  - Clothing list view with category filters
  - Clothing form (create/edit)
  - Clothing detail view
  - Image upload component with preview
  - Responsive grid layout for cards

- [x] **Implement clothing CRUD operations**
  - Create clothing items with required fields
  - Edit existing items
  - Delete items with confirmation
  - List items with pagination

## Phase 4: Outfit Management

- [x] **Design and implement database schema for outfits**
  - Create outfits table
  - Create outfit_items join table
  - Add foreign keys and constraints
  - Write migration

- [x] **Create outfit API routes**
  - GET /api/outfits
  - POST /api/outfits
  - GET /api/outfits/[id] with item details
  - PUT /api/outfits/[id]
  - DELETE /api/outfits/[id]
  - Add Zod validation

- [x] **Build outfit UI components**
  - Outfit list view
  - Outfit creation form with clothing selector
  - Multi-select clothing component
  - Outfit detail view with item breakdown
  - Preview composition visually

- [x] **Implement outfit composition**
  - Select multiple clothing items per outfit
  - Validate outfit has at least one item
  - Display outfit preview
  - Edit outfit composition

## Phase 5: Tab Navigation & Responsive Design

- [x] **Implement tab navigation system**
  - Bottom tab bar for mobile
  - Top navigation for desktop
  - Tab state management
  - Route protection for authenticated pages

- [x] **Build responsive layouts**
  - Mobile-first CSS approach
  - Responsive breakpoints (mobile, tablet, desktop)
  - Grid layouts for desktop
  - Single column for mobile

- [x] **Optimize UI for mobile**
  - Touch-friendly targets (min 44px)
  - Mobile form layouts
  - Bottom navigation
  - Vertical scrolling lists

- [x] **Optimize UI for desktop**
  - Multi-column card grids
  - Top navigation
  - Hover effects
  - Wider content containers

## Phase 6: Data Isolation & Security

- [x] **Implement user data scoping**
  - All queries filtered by user_id
  - Middleware to verify ownership
  - Prevent cross-user data access
  - Add integration tests

- [ ] **Add CSRF protection**
  - Implement CSRF token middleware
  - Validate tokens on mutations
  - Token refresh mechanism

- [x] **Implement input sanitization**
  - Server-side validation on all inputs
  - Sanitize user-generated content
  - Validate file uploads

- [ ] **Add audit logging**
  - Log all data mutations
  - Track user actions
  - Log authentication events

## Phase 7: Image Optimization

- [x] **Implement server-side image compression**
  - Add image compression utility (max 1MB file size)
  - Implement image resizing (max 1920px longest dimension)
  - Preserve aspect ratio during resize
  - Use sharp or similar library for processing
  - Add error handling for corrupt images
  - Test with various image sizes and formats

- [ ] **Generate thumbnails**
  - Create thumbnail versions
  - Store original and thumbnail
  - Use thumbnails in lists
  - Use original in detail views

- [ ] **Optimize image serving**
  - Use Next.js Image component
  - Lazy loading for lists
  - Responsive image sizes
  - Cache headers

## Phase 8: Testing & Validation

- [ ] **Write unit tests for business logic**
  - Auth service tests
  - Validation utilities
  - Database operations
  - File upload handling

- [ ] **Write integration tests for API routes**
  - Auth endpoints
  - Clothing CRUD operations
  - Outfit operations
  - Error scenarios

- [ ] **Add end-to-end tests for critical flows**
  - User registration and login
  - Upload clothing item
  - Create and view outfit
  - Data isolation between users

- [ ] **Manual testing checklist**
  - Test on mobile viewport
  - Test on desktop viewport
  - Test image upload various sizes
  - Test all CRUD operations
  - Test data isolation

## Phase 9: Documentation & Deployment

- [ ] **Create project documentation**
  - Setup instructions
  - Environment configuration
  - API documentation
  - Database schema reference

- [ ] **Create deployment guide**
  - Environment variables (S3 configuration template)
  - Database setup
  - S3 storage configuration
  - Backup procedures

- [ ] **Set up backup strategy**
  - Automated SQLite backups
  - S3 versioning and lifecycle policies
  - Backup retention policy
  - Restore procedure

- [ ] **Production configuration**
  - Configure production environment variables (S3 credentials)
  - Set up HTTPS
  - Configure build process
  - Validate S3 configuration on startup
  - Test production deployment

## Dependencies & Parallelization

### Parallelizable Tasks

- Phase 1 tasks can be done independently
- UI components (Phase 3-4) can be built in parallel with API routes
- Testing (Phase 8) can be done incrementally

### Sequential Dependencies

- Phase 2 (Auth) must complete before Phase 3-4 (data isolation)
- Phase 3 (Clothing) must complete before Phase 4 (Outfits)
- Phase 6 (Security) should follow initial feature implementation
- All phases must complete before Phase 9 (Deployment)

### Estimated Timeline

- Phase 1: 1-2 days
- Phase 2: 2-3 days
- Phase 3: 3-4 days
- Phase 4: 2-3 days
- Phase 5: 2-3 days
- Phase 6: 1-2 days
- Phase 7: 1-2 days
- Phase 8: 2-3 days
- Phase 9: 1-2 days

**Total: 15-24 days** depending on complexity and testing depth
