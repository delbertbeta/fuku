# Design: MariaDB Database Adapter

## System Overview

本设计描述了如何通过数据库适配器模式（Database Adapter Pattern）实现 SQLite 和 MariaDB 的双支持，同时保持现有 API 的兼容性。

## Architecture

### Component Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Application Layer                        │
│  (API Routes, Auth Modules, Business Logic)                 │
│                                                              │
│  getDb() → get database connection                          │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   Database Adapter Layer                    │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  IDatabaseAdapter Interface                          │  │
│  │  - query(sql: string, params?: any[]): Promise<Row[]>│  │
│  │  - exec(sql: string, params?: any[]): Promise<void>  │  │
│  │  - prepare(sql: string): Statement                    │  │
│  │  - transaction<T>(fn: () => T): T                     │  │
│  │  - close(): void                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ▼                                   │
│  ┌──────────────────────┐  ┌────────────────────────────┐   │
│  │  SQLiteAdapter       │  │  MariaDBAdapter           │   │
│  │  - better-sqlite3     │  │  - mariadb connector      │   │
│  │  - file-based         │  │  - connection pool        │   │
│  │  - WAL mode           │  │  - prepared statements    │   │
│  └──────────────────────┘  └────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     Database Storage                         │
│  ┌─────────────────┐         ┌─────────────────┐           │
│  │  SQLite File    │         │  MariaDB Server │           │
│  │  (local)        │         │  (network)      │           │
│  └─────────────────┘         └─────────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

## Data Models

### Database Configuration

```typescript
interface DatabaseConfig {
  type: "sqlite" | "mariadb";
  sqlite?: {
    path: string;
    walMode?: boolean;
  };
  mariadb?: {
    url: string; // Format: mysql://username:password@host:port/database
  };
}
```

### Adapter Interface

```typescript
export interface IDatabaseAdapter {
  query(sql: string, params?: any[]): Promise<any[]>;
  exec(sql: string, params?: any[]): Promise<void>;
  prepare(sql: string): DatabaseStatement;
  transaction<T>(fn: () => T): T;
  close(): void;
}

export interface DatabaseStatement {
  get(params?: any[]): any;
  all(params?: any[]): any[];
  run(params?: any[]): DatabaseResult;
}

export interface DatabaseResult {
  lastInsertRowid?: number;
  changes: number;
}
```

## Detailed Design

### 1. Adapter Base Interface

`src/lib/db/adapter/base.ts`

定义统一的数据库操作接口，隐藏不同数据库的实现细节。

```typescript
export interface IDatabaseAdapter {
  query(sql: string, params?: any[]): Promise<any[]>;
  exec(sql: string, params?: any[]): Promise<void>;
  prepare(sql: string): DatabaseStatement;
  transaction<T>(fn: () => T): T;
  close(): void;
}

export interface DatabaseStatement {
  get(params?: any[]): any | undefined;
  all(params?: any[]): any[];
  run(params?: any[]): DatabaseResult;
}

export interface DatabaseResult {
  lastInsertRowid?: number;
  changes: number;
}
```

**Rationale**:

- 统一的接口允许上层代码不关心底层实现
- `query()` 用于 SELECT 等返回数据的查询
- `exec()` 用于 INSERT、UPDATE、DELETE 等不返回数据的操作
- `prepare()` 用于预编译语句（提高性能）
- `transaction()` 用于事务管理
- `close()` 用于释放连接资源

### 2. SQLite Adapter Implementation

`src/lib/db/adapter/sqlite.ts`

基于现有的 better-sqlite3 实现，封装为适配器接口。

```typescript
import Database from "better-sqlite3";
import { IDatabaseAdapter, DatabaseStatement, DatabaseResult } from "./base";

export class SQLiteAdapter implements IDatabaseAdapter {
  private db: Database.Database;

  constructor(dbPath: string, walMode: boolean = true) {
    this.db = new Database(dbPath);
    if (walMode) {
      this.db.pragma("journal_mode = WAL");
    }
    this.db.pragma("foreign_keys = ON");
  }

  async query(sql: string, params: any[] = []): Promise<any[]> {
    const stmt = this.db.prepare(sql);
    return stmt.all(params);
  }

  async exec(sql: string, params: any[] = []): Promise<void> {
    const stmt = this.db.prepare(sql);
    stmt.run(params);
  }

  prepare(sql: string): DatabaseStatement {
    const stmt = this.db.prepare(sql);
    return new SQLiteStatement(stmt);
  }

  transaction<T>(fn: () => T): T {
    const tx = this.db.transaction(fn);
    return tx();
  }

  close(): void {
    this.db.close();
  }
}

class SQLiteStatement implements DatabaseStatement {
  constructor(private stmt: Database.Statement) {}

  get(params: any[] = []): any | undefined {
    return this.stmt.get(params);
  }

  all(params: any[] = []): any[] {
    return this.stmt.all(params);
  }

  run(params: any[] = []): DatabaseResult {
    const result = this.stmt.run(params);
    return {
      lastInsertRowid: result.lastInsertRowid as number,
      changes: result.changes,
    };
  }
}
```

**Rationale**:

- 复用现有的 better-sqlite3 实现
- WAL 模式提供更好的并发性能
- 封装为 Promise 接口，保持 API 一致性

### 3. MariaDB Adapter Implementation

`src/lib/db/adapter/mariadb.ts`

使用 mariadb Connector/Node.js 驱动实现适配器接口。

```typescript
import mariadb, { Pool, PoolConnection } from "mariadb";
import { IDatabaseAdapter, DatabaseStatement, DatabaseResult } from "./base";

export class MariaDBAdapter implements IDatabaseAdapter {
  private pool: Pool;

  constructor(url: string) {
    this.pool = mariadb.createPool(url, {
      connectionLimit: 10, // 默认连接池大小
      acquireTimeout: 30000,
    });
  }

  async query(sql: string, params: any[] = []): Promise<any[]> {
    let conn: PoolConnection | null = null;
    try {
      conn = await this.pool.getConnection();
      const rows = await conn.query(sql, params);
      return Array.isArray(rows) ? rows : [rows];
    } finally {
      if (conn) conn.release();
    }
  }

  async exec(sql: string, params: any[] = []): Promise<void> {
    let conn: PoolConnection | null = null;
    try {
      conn = await this.pool.getConnection();
      await conn.query(sql, params);
    } finally {
      if (conn) conn.release();
    }
  }

  prepare(sql: string): DatabaseStatement {
    return new MariaDBStatement(this.pool, sql);
  }

  transaction<T>(fn: () => T): T {
    // 实现事务支持
    throw new Error("Transaction not yet implemented");
  }

  close(): void {
    this.pool.end();
  }
}

class MariaDBStatement implements DatabaseStatement {
  constructor(
    private pool: Pool,
    private sql: string
  ) {}

  async get(params: any[] = []): Promise<any | undefined> {
    let conn: PoolConnection | null = null;
    try {
      conn = await this.pool.getConnection();
      const rows = await conn.query(this.sql, params);
      return Array.isArray(rows) ? rows[0] : rows;
    } finally {
      if (conn) conn.release();
    }
  }

  async all(params: any[] = []): Promise<any[]> {
    let conn: PoolConnection | null = null;
    try {
      conn = await this.pool.getConnection();
      const rows = await conn.query(this.sql, params);
      return Array.isArray(rows) ? rows : [rows];
    } finally {
      if (conn) conn.release();
    }
  }

  async run(params: any[] = []): Promise<DatabaseResult> {
    let conn: PoolConnection | null = null;
    try {
      conn = await this.pool.getConnection();
      const result = await conn.query(this.sql, params);
      return {
        lastInsertRowid: result.insertId,
        changes: result.affectedRows,
      };
    } finally {
      if (conn) conn.release();
    }
  }
}
```

**Rationale**:

- 使用连接池提高性能
- 默认连接池大小为 10（可根据需要调整）
- 自动释放连接，避免连接泄漏
- Promise 接口与 SQLite adapter 保持一致

### 4. Connection Management Refactor

`src/lib/db/connection.ts`

重构为根据环境变量选择适配器。

```typescript
import { IDatabaseAdapter } from "./adapter/base";
import { SQLiteAdapter } from "./adapter/sqlite";
import { MariaDBAdapter } from "./adapter/mariadb";
import path from "path";

let adapter: IDatabaseAdapter | null = null;
let initialized = false;

export function getDb(): IDatabaseAdapter {
  if (!adapter) {
    const dbType = process.env.DATABASE_TYPE || "sqlite";

    if (dbType === "mariadb") {
      adapter = createMariaDBAdapter();
    } else {
      adapter = createSQLiteAdapter();
    }

    if (!initialized) {
      initializeSchema();
      initialized = true;
    }
  }
  return adapter;
}

function createSQLiteAdapter(): IDatabaseAdapter {
  const dbPath = process.env.DATABASE_PATH || "./data/outfit-platform.db";
  const dbDir = path.dirname(dbPath);
  const fs = require("fs");

  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  return new SQLiteAdapter(dbPath);
}

function createMariaDBAdapter(): IDatabaseAdapter {
  const url = process.env.MARIADB_URL;

  if (!url) {
    throw new Error(
      "MARIADB_URL environment variable is required when DATABASE_TYPE=mariadb"
    );
  }

  return new MariaDBAdapter(url);
}

export function closeDb(): void {
  if (adapter) {
    adapter.close();
    adapter = null;
  }
}
```

**Rationale**:

- 保持 `getDb()` 函数签名不变，确保兼容性
- 根据 `DATABASE_TYPE` 环境变量选择适配器
- 提供合理的默认值

### 5. Schema Dialect Support

`src/lib/db/schema.ts`

重构为支持不同数据库的 DDL 语法。

```typescript
import { getDb } from "./connection";

export function initializeSchema(): void {
  const db = getDb();
  const dbType = process.env.DATABASE_TYPE || "sqlite";

  const schema = getSchema(dbType);

  db.exec(schema);
  migrateCategories(db);
  migrateCategoryToId(db, dbType);
}

function getSchema(dbType: string): string {
  const autoIncrement =
    dbType === "mariadb"
      ? "INT AUTO_INCREMENT"
      : "INTEGER PRIMARY KEY AUTOINCREMENT";

  const primaryKey = dbType === "mariadb" ? "PRIMARY KEY" : "PRIMARY KEY";

  const references =
    dbType === "mariadb"
      ? (table: string, column: string, action: string) =>
          `REFERENCES ${table}(${column}) ON DELETE ${action}`
      : (table: string, column: string, action: string) =>
          `REFERENCES ${table}(${column}) ON DELETE ${action}`;

  return `
    CREATE TABLE IF NOT EXISTS users (
      id ${autoIncrement} ${primaryKey},
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id VARCHAR(255) ${primaryKey},
      user_id INT NOT NULL ${references("users", "id", "CASCADE")},
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_sessions_user_id (user_id),
      INDEX idx_sessions_expires_at (expires_at)
    );

    CREATE TABLE IF NOT EXISTS clothing_categories (
      id ${autoIncrement} ${primaryKey},
      user_id INT NOT NULL ${references("users", "id", "CASCADE")},
      name VARCHAR(255) NOT NULL,
      is_system TINYINT(1) NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, name),
      INDEX idx_clothing_categories_user_id (user_id)
    );

    CREATE TABLE IF NOT EXISTS clothing_items (
      id ${autoIncrement} ${primaryKey},
      user_id INT NOT NULL ${references("users", "id", "CASCADE")},
      category INT NOT NULL ${references("clothing_categories", "id", "CASCADE")},
      name VARCHAR(255) NOT NULL,
      description TEXT,
      image_path VARCHAR(255) NOT NULL,
      price DECIMAL(10, 2),
      purchase_date DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, name),
      INDEX idx_clothing_items_user_id (user_id),
      INDEX idx_clothing_items_category (category)
    );

    CREATE TABLE IF NOT EXISTS outfits (
      id ${autoIncrement} ${primaryKey},
      user_id INT NOT NULL ${references("users", "id", "CASCADE")},
      name VARCHAR(255) NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_outfits_user_id (user_id)
    );

    CREATE TABLE IF NOT EXISTS outfit_items (
      outfit_id INT NOT NULL ${references("outfits", "id", "CASCADE")},
      clothing_id INT NOT NULL ${references("clothing_items", "id", "CASCADE")},
      PRIMARY KEY (outfit_id, clothing_id)
    );
  `;
}

function migrateCategories(db: IDatabaseAdapter): void {
  const dbType = process.env.DATABASE_TYPE || "sqlite";

  const checkTableSql =
    dbType === "mariadb"
      ? `SELECT table_name FROM information_schema.tables WHERE table_name = 'clothing_categories'`
      : `SELECT name FROM sqlite_master WHERE type='table' AND name='clothing_categories'`;

  const tableExists = db.query(checkTableSql);
  if (tableExists.length === 0) return;

  const checkColumnSql =
    dbType === "mariadb"
      ? `SELECT column_name FROM information_schema.columns WHERE table_name = 'clothing_categories' AND column_name = 'is_system'`
      : `SELECT name FROM pragma_table_info('clothing_categories') WHERE name = 'is_system'`;

  const columnExists = db.query(checkColumnSql);
  if (columnExists.length === 0) return;

  const users = db.query("SELECT id FROM users");
  const defaultCategories = [
    { name: "上装" },
    { name: "外套" },
    { name: "下装" },
    { name: "鞋子" },
    { name: "未分类" },
  ];

  for (const user of users) {
    for (const cat of defaultCategories) {
      db.query(
        `INSERT IGNORE INTO clothing_categories (user_id, name, is_system) VALUES (?, ?, 1)`,
        [user.id, cat.name]
      );
    }
  }
}

function migrateCategoryToId(db: IDatabaseAdapter, dbType: string): void {
  // 类似的实现，处理数据类型差异
  // ...
}
```

**Rationale**:

- 根据数据库类型生成不同的 DDL
- 统一使用 TIMESTAMP 表示日期时间
- 使用 VARCHAR 代替 TEXT 以兼容 MariaDB
- 在 CREATE TABLE 中包含索引定义（MariaDB 风格）
- 迁移逻辑适配不同数据库的系统表查询

## Type Mappings

| SQLite Type   | MariaDB Type        | Application Representation |
| ------------- | ------------------- | -------------------------- |
| INTEGER       | INT                 | number                     |
| TEXT          | VARCHAR(255) / TEXT | string                     |
| REAL          | DECIMAL(10,2)       | number                     |
| DATETIME      | TIMESTAMP           | Date / string              |
| INTEGER (0/1) | TINYINT(1)          | boolean (mapped to 0/1)    |

## Configuration Examples

### SQLite Configuration (Default)

```bash
DATABASE_TYPE=sqlite
DATABASE_PATH=./data/outfit-platform.db
```

### MariaDB Configuration

```bash
DATABASE_TYPE=mariadb
MARIADB_URL=mysql://outfit_user:secure_password@localhost:3306/outfit_platform
```

## Error Handling

### Connection Errors

- SQLite: 文件不存在或权限问题
- MariaDB: 连接超时、认证失败、数据库不存在

**Strategy**: 记录详细错误日志，抛出包含上下文的错误对象

### Query Errors

- SQL 语法错误（在开发阶段发现）
- 约束违反（如重复键）
- 数据类型不匹配

**Strategy**: 捕获数据库特定错误，转换为统一的错误类型

### Transaction Errors

- 锁冲突
- 死锁

**Strategy**: 实现重试机制，设置合理的超时时间

## Performance Considerations

### Connection Pooling

- SQLite: 单连接（WAL 模式支持并发读）
- MariaDB: 连接池（默认 10 个连接）

### Prepared Statements

- 两种数据库都支持预编译语句
- 重复查询使用 `prepare()` 提高性能

### Indexing

- 已定义的索引保持不变
- 添加数据库特定的索引优化建议

## Migration Notes

### Existing Code Compatibility

- 所有调用 `getDb()` 的代码无需修改
- `prepare()` 返回的 `DatabaseStatement` 接口保持一致
- 查询参数传递方式不变（数组形式）

### Breaking Changes

- 无 API 级别的破坏性变更
- 只影响数据库内部实现

## Testing Strategy

### Unit Tests

1. 测试 adapter 接口实现
2. 测试 schema 生成逻辑
3. 测试连接管理

### Integration Tests

1. 测试 SQLite 下的完整功能
2. 测试 MariaDB 下的完整功能
3. 测试环境变量切换

### Test Database Setup

- 使用内存数据库进行 SQLite 测试
- 使用 Docker 容器进行 MariaDB 测试

## Security Considerations

### SQL Injection Prevention

- 所有查询使用参数化语句
- 不拼接 SQL 字符串

### Credentials Management

- 密码通过环境变量传递
- 不在代码中硬编码凭据
- 不在日志中输出敏感信息

### Connection Security

- 支持 SSL/TLS 连接（可选配置）
- 连接池避免连接泄漏

## Future Enhancements

### Connection Pool Configuration

- 支持自定义连接池大小
- 支持连接超时配置
- 支持查询超时配置

### Query Logging

- 可选的查询日志记录
- 性能指标收集

### Database-Specific Optimizations

- MariaDB: 使用 JSON 字段存储扩展数据
- SQLite: 启用查询计划分析
