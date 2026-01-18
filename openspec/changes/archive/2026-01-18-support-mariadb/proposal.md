# Proposal: Support MariaDB Database Backend

## Summary

添加对 MariaDB 数据库的支持，同时保持与现有 SQLite 数据库的兼容性。通过环境变量配置数据库类型，实现数据库后端的灵活切换。

## Motivation

当前项目仅支持 SQLite 数据库，虽然 SQLite 适合开发和中小规模应用，但在生产环境中可能遇到以下限制：

- 单文件存储，不利于高并发写入
- 缺乏连接池和高级数据库功能
- 难以与现有基础设施集成

支持 MariaDB 可以：

- 提供更好的并发性能
- 支持分布式部署
- 与企业级数据库生态集成

## Goals

1. 在现有 SQLite 基础上添加 MariaDB 支持
2. 通过 `DATABASE_TYPE` 环境变量（`sqlite` | `mariadb`）切换数据库类型
3. 保持现有 API 和数据模型不变
4. 实现数据库抽象层，隔离不同数据库的差异

## Non-Goals

- 提供自动化的 SQLite 到 MariaDB 数据迁移工具
- 支持其他数据库（如 PostgreSQL、MySQL）
- 重构现有的数据访问逻辑（保持 API 兼容）
- 性能优化或查询重写

## Out of Scope

- 数据同步或主从复制
- 数据库连接池的高级配置
- SQL 性能分析和优化
- 数据库监控和日志

## Proposed Solution

### Architecture Overview

引入数据库适配器模式（Database Adapter Pattern），创建抽象层来隔离数据库特定的实现：

```
src/lib/db/
├── adapter/              # 数据库适配器
│   ├── base.ts          # 基础接口定义
│   ├── sqlite.ts        # SQLite 实现
│   └── mariadb.ts       # MariaDB 实现
├── connection.ts        # 连接管理（重构）
├── schema.ts            # Schema 定义（数据库无关）
└── index.ts             # 导出接口
```

### Key Components

1. **Database Adapter Interface** (`adapter/base.ts`)
   - 定义统一的数据库操作接口
   - 支持查询、执行、事务等操作
   - 隐藏数据库特定的 API 差异

2. **SQLite Adapter** (`adapter/sqlite.ts`)
   - 封装 better-sqlite3 API
   - 适配现有实现逻辑

3. **MariaDB Adapter** (`adapter/mariadb.ts`)
   - 使用 mariadb Connector/Node.js 驱动
   - 实现 MySQL 协议兼容的接口

4. **Schema Migration** (`schema.ts`)
   - 重构为支持不同数据库的 DDL 语法
   - 使用参数化查询处理类型差异

5. **Configuration**
   - `DATABASE_TYPE`: 数据库类型 (`sqlite` | `mariadb`)
   - `DATABASE_PATH`: SQLite 数据库文件路径（当 DATABASE_TYPE=sqlite 时）
   - `MARIADB_URL`: MariaDB 连接字符串，格式：`mysql://username:password@host:port/database`

### Database Type Detection

```typescript
// connection.ts
const dbType = process.env.DATABASE_TYPE || "sqlite";

if (dbType === "mariadb") {
  // 使用 MariaDB adapter
} else {
  // 使用 SQLite adapter（默认）
}
```

### SQL Dialect Compatibility

主要需要处理的差异：

| Feature        | SQLite                                   | MariaDB                                  |
| -------------- | ---------------------------------------- | ---------------------------------------- |
| Auto Increment | `INTEGER PRIMARY KEY AUTOINCREMENT`      | `INT AUTO_INCREMENT PRIMARY KEY`         |
| Boolean        | `INTEGER` (0/1)                          | `BOOLEAN` / `TINYINT(1)`                 |
| DateTime       | `DATETIME`                               | `DATETIME` / `TIMESTAMP`                 |
| Index          | `CREATE INDEX IF NOT EXISTS`             | `CREATE INDEX IF NOT EXISTS`             |
| Limit/Offset   | `LIMIT ? OFFSET ?`                       | `LIMIT ? OFFSET ?`                       |
| Foreign Key    | `REFERENCES table(id) ON DELETE CASCADE` | `REFERENCES table(id) ON DELETE CASCADE` |

### Migration Strategy

1. 保留现有 SQLite 实现
2. 创建 MariaDB adapter 作为可选实现
3. 重构 connection.ts 使用 adapter 接口
4. 更新 schema.ts 支持数据库特定的语法
5. 添加环境变量配置文档
6. 更新 .env.example 示例

## Related Capabilities

- **user-authentication**: 用户注册、登录、会话管理依赖数据库存储
- **clothing-management**: 服装数据管理依赖数据库存储
- **outfit-management**: 搭配数据管理依赖数据库存储
- **category-management**: 分类数据管理依赖数据库存储

## Risks and Mitigations

### Risk 1: SQL 语法差异导致查询错误

**Mitigation**: 通过 adapter 抽象层处理语法差异，提供统一的接口。使用参数化查询避免 SQL 注入和语法问题。

### Risk 2: 类型系统差异（如 Boolean 类型）

**Mitigation**: 在应用层统一使用数值类型（0/1）表示布尔值，适配器层负责转换。

### Risk 3: 连接池管理复杂度

**Mitigation**: MariaDB adapter 封装连接池配置，提供简单的配置接口。默认使用合理的连接池参数。

### Risk 4: 现有代码兼容性

**Mitigation**: 保持 `getDb()` 函数签名不变，内部实现切换到 adapter 模式。确保所有现有代码无需修改即可工作。

## Dependencies

### External Dependencies

- `mariadb`: MariaDB Connector/Node.js 驱动
- `@types/mariadb`: TypeScript 类型定义

### Internal Dependencies

- 现有数据库相关模块需要重构以支持 adapter 模式

## Success Criteria

1. 可以通过环境变量切换 SQLite 和 MariaDB
2. 所有现有的 API 路由在两种数据库下都能正常工作
3. 数据模型和业务逻辑保持不变
4. 新的 MariaDB 配置有完整的文档说明
5. 代码通过现有的 lint 和 typecheck 检查

## Alternatives Considered

### Alternative 1: 使用 ORM (如 Prisma)

**Pros**: 提供类型安全，自动处理数据库差异
**Cons**: 引入新的学习曲线，增加依赖复杂度，重构成本高
**Decision**: 不采用，保持轻量级方案

### Alternative 2: 使用 Query Builder (如 Knex.js)

**Pros**: 提供统一的 SQL 构建接口，支持多数据库
**Cons**: 需要重写所有 SQL 查询，学习曲线
**Decision**: 不采用，直接使用 adapter 模式更轻量

### Alternative 3: 只支持 MariaDB，移除 SQLite

**Pros**: 减少维护成本
**Cons**: 不适合开发和测试环境
**Decision**: 不采用，保持两者并存

## Implementation Timeline

1. 创建 adapter 接口和 MariaDB 实现
2. 重构 connection.ts 使用 adapter
3. 更新 schema.ts 支持 MariaDB
4. 添加环境变量配置和文档
5. 测试验证两种数据库的兼容性

## Open Questions

1. 是否需要提供 MariaDB 连接池的高级配置（如最大连接数、超时时间）？- **已回答**: 仅基础连接信息
2. 是否需要提供数据迁移工具？- **已回答**: 用户通过 env 设置切换，不提供自动迁移工具
