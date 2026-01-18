# database-adapter Specification

## Purpose
TBD - created by archiving change support-mariadb. Update Purpose after archive.
## Requirements
### Requirement: Database Type Configuration

The system MUST support configuring the database backend type through environment variables.

#### Scenario: Default SQLite configuration

**Given** the `DATABASE_TYPE` environment variable is not set
**When** the application starts
**Then** the system defaults to SQLite database
**And** uses the `DATABASE_PATH` environment variable (default: `./data/outfit-platform.db`)

#### Scenario: Explicit SQLite configuration

**Given** the `DATABASE_TYPE` environment variable is set to `sqlite`
**And** the `DATABASE_PATH` environment variable is set to `/path/to/database.db`
**When** the application starts
**Then** the system initializes SQLite database at the specified path

#### Scenario: MariaDB configuration

**Given** the `DATABASE_TYPE` environment variable is set to `mariadb`
**And** the `MARIADB_URL` environment variable is configured with format `mysql://username:password@host:port/database`
**When** the application starts
**Then** the system initializes MariaDB database connection with connection pool

### Requirement: Database Adapter Interface

The system MUST provide a unified database adapter interface that abstracts database-specific implementations.

#### Scenario: Query execution for SELECT statements

**Given** a valid SELECT SQL statement with parameter placeholders
**When** the `query(sql, params)` method is called on the database adapter
**Then** the adapter executes the query with the provided parameters
**And** returns an array of result rows
**And** the implementation is transparent to the caller (SQLite or MariaDB)

#### Scenario: Execution for INSERT/UPDATE/DELETE statements

**Given** a valid INSERT, UPDATE, or DELETE SQL statement with parameter placeholders
**When** the `exec(sql, params)` method is called on the database adapter
**Then** the adapter executes the statement with the provided parameters
**And** returns a result object with `changes` and `lastInsertRowid`

#### Scenario: Prepared statement creation

**Given** a valid SQL statement with parameter placeholders
**When** the `prepare(sql)` method is called on the database adapter
**Then** the adapter creates a prepared statement object
**And** the prepared statement supports `get()`, `all()`, and `run()` methods
**And** the prepared statement can be reused multiple times with different parameters

#### Scenario: Transaction management

**Given** a database adapter instance
**When** the `transaction(fn)` method is called with a callback function
**Then** the adapter starts a database transaction
**And** executes the callback function
**And** commits the transaction on success
**And** rolls back the transaction on error
**And** propagates any errors to the caller

#### Scenario: Database connection cleanup

**Given** a database adapter instance with an active connection
**When** the `close()` method is called on the adapter
**Then** the adapter closes the database connection
**And** releases all resources
**And** subsequent calls to database operations throw an error

### Requirement: SQLite Adapter Implementation

The system MUST provide a SQLite adapter implementation using better-sqlite3.

#### Scenario: SQLite connection initialization

**Given** the `DATABASE_TYPE` is set to `sqlite`
**When** the database adapter is initialized
**Then** the adapter creates a SQLite database connection
**And** enables WAL (Write-Ahead Logging) mode for better concurrency
**And** enables foreign key constraints
**And** creates the database file and parent directory if they don't exist

#### Scenario: SQLite prepared statement execution

**Given** a SQLite adapter instance
**And** a prepared statement created with `prepare()`
**When** the `get(params)` method is called on the prepared statement
**Then** the adapter executes the statement with parameters
**And** returns a single result row or undefined

#### Scenario: SQLite transaction isolation

**Given** a SQLite adapter instance
**When** a transaction is started with `transaction(fn)`
**Then** all operations within the transaction are isolated
**And** concurrent readers can read the database (due to WAL mode)

### Requirement: MariaDB Adapter Implementation

The system MUST provide a MariaDB adapter implementation using mariadb Connector/Node.js.

#### Scenario: MariaDB connection pool initialization

**Given** the `DATABASE_TYPE` is set to `mariadb`
**And** the `MARIADB_URL` environment variable is set to a valid MariaDB connection string
**When** the database adapter is initialized
**Then** the adapter creates a connection pool with default settings:

- Connection limit: 10
- Acquire timeout: 30000ms
  **And** the adapter establishes connections to the MariaDB server

#### Scenario: MariaDB query execution

**Given** a MariaDB adapter instance
**And** a valid SELECT SQL statement
**When** the `query(sql, params)` method is called
**Then** the adapter acquires a connection from the pool
**And** executes the query with parameters
**And** returns the result as an array of rows
**And** releases the connection back to the pool

#### Scenario: MariaDB prepared statement execution

**Given** a MariaDB adapter instance
**And** a prepared statement created with `prepare()`
**When** the `get(params)` method is called on the prepared statement
**Then** the adapter acquires a connection from the pool
**And** executes the prepared statement with parameters
**And** returns a single result row or undefined
**And** releases the connection back to the pool

#### Scenario: MariaDB transaction management

**Given** a MariaDB adapter instance
**When** the `transaction(fn)` method is called
**Then** the adapter starts a database transaction (BEGIN)
**And** executes the callback function
**And** commits the transaction (COMMIT) on success
**And** rolls back the transaction (ROLLBACK) on error
**And** the connection is properly released back to the pool

#### Scenario: MariaDB connection pool cleanup

**Given** a MariaDB adapter instance with an active connection pool
**When** the `close()` method is called
**Then** the adapter closes all connections in the pool
**And** releases all resources

### Requirement: Database Schema Generation

The system MUST generate database-specific DDL statements based on the configured database type.

#### Scenario: SQLite schema generation

**Given** the database type is SQLite
**When** the schema is generated
**Then** the DDL uses SQLite-specific syntax:

- `INTEGER PRIMARY KEY AUTOINCREMENT` for auto-increment columns
- `TEXT` for string columns
- `DATETIME` for timestamp columns
- `INTEGER` for boolean columns (0/1)
- Indexes created with `CREATE INDEX IF NOT EXISTS`
- Foreign keys with `ON DELETE CASCADE`

#### Scenario: MariaDB schema generation

**Given** the database type is MariaDB
**When** the schema is generated
**Then** the DDL uses MariaDB-specific syntax:

- `INT AUTO_INCREMENT PRIMARY KEY` for auto-increment columns
- `VARCHAR(255)` for string columns
- `TIMESTAMP` for timestamp columns
- `TINYINT(1)` for boolean columns (0/1)
- Indexes created inline with table definition or `CREATE INDEX`
- Foreign keys with `ON DELETE CASCADE`

#### Scenario: Schema initialization

**Given** a database adapter instance
**And** the database type is configured
**When** the `initializeSchema()` function is called
**Then** the system generates the appropriate schema for the database type
**And** executes the schema DDL statements
**And** runs any necessary migrations

### Requirement: Database Migration Compatibility

The system MUST support database-specific query syntax in migration functions.

#### Scenario: SQLite system table queries

**Given** the database type is SQLite
**When** a migration needs to check if a table exists
**Then** the system uses `SELECT name FROM sqlite_master WHERE type='table' AND name='table_name'`
**And** for checking columns, uses `PRAGMA table_info('table_name')`

#### Scenario: MariaDB system table queries

**Given** the database type is MariaDB
**When** a migration needs to check if a table exists
**Then** the system uses `SELECT table_name FROM information_schema.tables WHERE table_name = 'table_name'`
**And** for checking columns, uses `SELECT column_name FROM information_schema.columns WHERE table_name = 'table_name' AND column_name = 'column_name'`

#### Scenario: Migration execution

**Given** a database adapter instance
**And** a migration function
**When** the migration is executed
**Then** the system uses the appropriate query syntax for the database type
**And** executes the migration SQL statements
**And** handles any errors during migration

### Requirement: Backward Compatibility

The system MUST maintain backward compatibility with existing code that uses the database layer.

#### Scenario: Existing API route compatibility

**Given** existing API routes that import and use `getDb()`
**When** the application is upgraded with MariaDB support
**Then** all existing API routes continue to work without modification
**And** the `getDb()` function returns an `IDatabaseAdapter` instance
**And** the `prepare()` method returns a `DatabaseStatement` instance
**And** all existing queries and statements execute correctly

#### Scenario: Default database type

**Given** an upgraded application without `DATABASE_TYPE` configured
**When** the application starts
**Then** the system defaults to SQLite (original behavior)
**And** all existing functionality continues to work as before

### Requirement: Type Safety

The database adapter implementation MUST maintain TypeScript type safety across different database implementations.

#### Scenario: Adapter interface type checking

**Given** the `IDatabaseAdapter` interface definition
**When** a database adapter class is implemented
**Then** the TypeScript compiler enforces that all interface methods are implemented
**And** method signatures match the interface definition
**And** return types are correctly typed

#### Scenario: Prepared statement type checking

**Given** the `DatabaseStatement` interface definition
**When** a prepared statement class is implemented
**Then** the TypeScript compiler enforces that all interface methods are implemented
**And** method signatures match the interface definition
**And** return types are correctly typed

