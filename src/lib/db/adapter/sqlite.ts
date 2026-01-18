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
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    for (const stmt of statements) {
      this.db.prepare(stmt).run();
    }
  }

  prepare(sql: string): DatabaseStatement {
    const stmt = this.db.prepare(sql);
    return new SQLiteStatement(stmt);
  }

  async transaction<T>(fn: () => T | Promise<T>): Promise<T> {
    const tx = this.db.transaction(fn);
    return Promise.resolve(tx());
  }

  close(): void {
    this.db.close();
  }
}

class SQLiteStatement implements DatabaseStatement {
  constructor(private stmt: Database.Statement) {}

  async get(params: any[] = []): Promise<any | undefined> {
    return this.stmt.get(params);
  }

  async all(params: any[] = []): Promise<any[]> {
    return this.stmt.all(params);
  }

  async run(params: any[] = []): Promise<DatabaseResult> {
    const result = this.stmt.run(params);
    return {
      lastInsertRowid: result.lastInsertRowid as number,
      changes: result.changes,
    };
  }
}
