import mariadb, { Pool, PoolConnection } from "mariadb";
import { IDatabaseAdapter, DatabaseStatement, DatabaseResult } from "./base";

export class MariaDBAdapter implements IDatabaseAdapter {
  private pool: Pool;

  constructor(url: string) {
    const config = parseMariaDBUrl(url);
    this.pool = mariadb.createPool({
      ...config,
      connectionLimit: 10,
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
      const statements = sql
        .split(";")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      for (const stmt of statements) {
        await conn.query(stmt, params);
      }
    } finally {
      if (conn) conn.release();
    }
  }

  prepare(sql: string): DatabaseStatement {
    return new MariaDBStatement(this.pool, sql);
  }

  async transaction<T>(fn: () => T | Promise<T>): Promise<T> {
    let conn: PoolConnection | null = null;
    try {
      conn = await this.pool.getConnection();
      await conn.beginTransaction();
      const result = await fn();
      await conn.commit();
      return result;
    } catch (error) {
      if (conn) await conn.rollback();
      throw error;
    } finally {
      if (conn) conn.release();
    }
  }

  close(): void {
    this.pool.end();
  }
}

function parseMariaDBUrl(url: string) {
  const protocol = "mysql://";
  if (!url.startsWith(protocol)) {
    throw new Error("Invalid MariaDB connection URL");
  }

  const rest = url.slice(protocol.length);

  const lastAt = rest.lastIndexOf("@");
  if (lastAt === -1) {
    throw new Error("Invalid MariaDB connection URL: missing @");
  }

  const userInfo = rest.slice(0, lastAt);
  const hostInfo = rest.slice(lastAt + 1);

  const colonIndex = userInfo.indexOf(":");
  const user = colonIndex === -1 ? userInfo : userInfo.slice(0, colonIndex);
  const password = colonIndex === -1 ? "" : userInfo.slice(colonIndex + 1);

  const slashIndex = hostInfo.indexOf("/");
  const database = slashIndex === -1 ? "" : hostInfo.slice(slashIndex + 1);
  const hostPart = slashIndex === -1 ? hostInfo : hostInfo.slice(0, slashIndex);

  const colonPortIndex = hostPart.indexOf(":");
  const host =
    colonPortIndex === -1 ? hostPart : hostPart.slice(0, colonPortIndex);
  const port =
    colonPortIndex === -1 ? 3306 : parseInt(hostPart.slice(colonPortIndex + 1));

  return { user, password, host, port, database };
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
