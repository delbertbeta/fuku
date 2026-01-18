export interface IDatabaseAdapter {
  query(sql: string, params?: any[]): Promise<any[]>;
  exec(sql: string, params?: any[]): Promise<void>;
  prepare(sql: string): DatabaseStatement;
  transaction<T>(fn: () => T | Promise<T>): Promise<T>;
  close(): void;
}

export interface DatabaseStatement {
  get(params?: any[]): Promise<any | undefined>;
  all(params?: any[]): Promise<any[]>;
  run(params?: any[]): Promise<DatabaseResult>;
}

export interface DatabaseResult {
  lastInsertRowid?: number;
  changes: number;
}
