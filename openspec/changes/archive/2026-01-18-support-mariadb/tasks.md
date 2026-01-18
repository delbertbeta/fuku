# Tasks: Support MariaDB Database Backend

## Task List

### Phase 1: Foundation and Dependencies

- [x] **Task 1.1**: Add MariaDB dependencies to `package.json`
  - Add `mariadb` package to dependencies
  - Add `@types/mariadb` to devDependencies
  - Verify installation with `npm install`

- [x] **Task 1.2**: Create adapter base interface
  - Create `src/lib/db/adapter/base.ts`
  - Define `IDatabaseAdapter` interface
  - Define `DatabaseStatement` interface
  - Define `DatabaseResult` interface
  - Export all interfaces

- [x] **Task 1.3**: Create SQLite adapter implementation
  - Create `src/lib/db/adapter/sqlite.ts`
  - Implement `SQLiteAdapter` class
  - Implement `SQLiteStatement` class
  - Migrate existing connection logic to adapter

### Phase 2: MariaDB Implementation

- [x] **Task 2.1**: Create MariaDB adapter implementation
  - Create `src/lib/db/adapter/mariadb.ts`
  - Implement `MariaDBAdapter` class with connection pool
  - Implement `MariaDBStatement` class
  - Handle connection management (acquire/release)

- [x] **Task 2.2**: Implement transaction support in MariaDB adapter
  - Add `transaction()` method to `MariaDBAdapter`
  - Handle BEGIN, COMMIT, ROLLBACK
  - Ensure proper error handling and rollback

### Phase 3: Connection Management

- [x] **Task 3.1**: Refactor `src/lib/db/connection.ts` to use adapter pattern
  - Import adapter interfaces
  - Modify `getDb()` to return `IDatabaseAdapter`
  - Add `createSQLiteAdapter()` helper
  - Add `createMariaDBAdapter()` helper
  - Implement database type detection via `DATABASE_TYPE` env var

- [x] **Task 3.2**: Update adapter creation with environment variables
  - Read `DATABASE_TYPE` (default: `sqlite`)
  - Read SQLite config: `DATABASE_PATH`
  - Read MariaDB config: `MARIADB_URL`
  - Validate that `MARIADB_URL` is required when using MariaDB

- [x] **Task 3.3**: Update `src/lib/db/index.ts` exports
  - Ensure `getDb()` returns `IDatabaseAdapter` type
  - Maintain backward compatibility for existing imports

### Phase 4: Schema Migration

- [x] **Task 4.1**: Refactor `src/lib/db/schema.ts` to support multiple databases
  - Create `getSchema(dbType)` function
  - Implement SQLite DDL dialect
  - Implement MariaDB DDL dialect
  - Handle type mappings (INTEGER -> INT, TEXT -> VARCHAR, etc.)

- [x] **Task 4.2**: Update `initializeSchema()` to use adapter
  - Accept `IDatabaseAdapter` parameter
  - Call `db.exec()` instead of `db.exec()`
  - Pass database type to schema generation

- [x] **Task 4.3**: Update migration functions for MariaDB compatibility
  - Refactor `migrateCategories()` for both databases
  - Refactor `migrateCategoryToId()` for both databases
  - Handle system table query differences (`sqlite_master` vs `information_schema`)
  - Handle column metadata query differences (`PRAGMA` vs `information_schema.columns`)

### Phase 5: Configuration and Documentation

- [x] **Task 5.1**: Update `.env.example` with MariaDB configuration
  - Add `DATABASE_TYPE` variable with default value
  - Add MariaDB connection variables with examples
  - Add comments explaining each variable

- [x] **Task 5.2**: Create database configuration documentation
  - Document SQLite configuration (default)
  - Document MariaDB configuration
  - Provide examples for both setups
  - Document environment variable reference

- [x] **Task 5.3**: Update `AGENTS.md` or create database setup guide
  - Document how to set up local MariaDB instance
  - Document Docker setup for MariaDB
  - Document database initialization steps

### Phase 6: Testing and Validation

- [ ] **Task 6.1**: Test SQLite adapter functionality
  - Verify existing API routes work with SQLite
  - Run all CRUD operations
  - Test transaction support
  - Verify schema initialization

- [ ] **Task 6.2**: Test MariaDB adapter functionality
  - Set up local MariaDB instance (or Docker)
  - Configure environment variables for MariaDB
  - Run all API routes
  - Test all CRUD operations
  - Verify schema initialization

- [ ] **Task 6.3**: Test database type switching
  - Switch between SQLite and MariaDB
  - Verify no breaking changes in application behavior
  - Test hot-reload scenarios

- [x] **Task 6.4**: Run linting and type checking
  - Run `npm run lint`
  - Run `npm run typecheck` (if available)
  - Fix any issues

- [ ] **Task 6.5**: Test connection error handling
  - Test invalid MariaDB connection parameters
  - Test SQLite file permission errors
  - Verify error messages are clear

### Phase 7: Cleanup and Optimization

- [x] **Task 7.1**: Remove unused better-sqlite3 direct imports
  - Search for remaining direct imports of `better-sqlite3`
  - Replace with adapter interface where needed
  - Ensure all code uses `getDb()` interface

- [x] **Task 7.2**: Add JSDoc comments to adapter interfaces
  - Document `IDatabaseAdapter` methods
  - Document `DatabaseStatement` methods
  - Document parameter types and return values

- [ ] **Task 7.3**: Add TypeScript type assertions where needed
  - Ensure strict type checking
  - Add type guards if necessary
  - Remove `any` types where possible

## Dependencies and Sequencing

- **Phase 1** must be completed before Phase 2 and Phase 3
- **Phase 2** must be completed before Phase 4
- **Phase 3** must be completed before Phase 4
- **Phase 4** must be completed before Phase 6
- **Phase 5** can be done in parallel with Phase 4
- **Phase 6** must be completed after Phase 4 and Phase 5
- **Phase 7** can be done in parallel with Phase 6 or after

## Parallelizable Tasks

- Tasks 5.1, 5.2, and 5.3 can be done in parallel with Phase 4
- Task 6.1 and 6.2 can be done in parallel (if resources allow)
- Task 7.1, 7.2, and 7.3 can be done in parallel with Phase 6

## Validation Criteria

- All tasks must be completed
- Both SQLite and MariaDB configurations must work
- All existing API routes must function correctly
- Code must pass linting and type checking
- No breaking changes to existing functionality

## Estimated Effort

- Phase 1: 2 hours
- Phase 2: 4 hours
- Phase 3: 2 hours
- Phase 4: 6 hours
- Phase 5: 2 hours
- Phase 6: 4 hours
- Phase 7: 2 hours

**Total Estimated Time**: 22 hours
