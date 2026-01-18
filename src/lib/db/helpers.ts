import { getDb } from "./connection";
import type { IDatabaseAdapter } from "./adapter/base";

export function getNowFunction(): string {
  const dbType = process.env.DATABASE_TYPE || "sqlite";
  return dbType === "mariadb" ? "NOW()" : "datetime('now')";
}

export function supportsReturning(): boolean {
  const dbType = process.env.DATABASE_TYPE || "sqlite";

  if (dbType === "mariadb") {
    return false;
  }

  // SQLite supports RETURNING from version 3.35.0
  // Assuming modern SQLite version, return true
  return true;
}

export async function insertAndGet(
  db: IDatabaseAdapter,
  table: string,
  columns: string[],
  values: any[]
): Promise<any> {
  const placeholders = columns.map(() => "?").join(", ");
  const returningClause = supportsReturning() ? "RETURNING *" : "";

  const insertSql = `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${placeholders})${returningClause}`;
  const stmt = db.prepare(insertSql);

  if (supportsReturning()) {
    return await stmt.get(values);
  } else {
    const result = await stmt.run(values);
    const getStmt = db.prepare(`SELECT * FROM ${table} WHERE id = ?`);
    return await getStmt.get([result.lastInsertRowid]);
  }
}

export async function updateAndGet(
  db: IDatabaseAdapter,
  table: string,
  updates: string[],
  values: any[],
  whereConditions: string[],
  whereValues: any[]
): Promise<any> {
  const setClause = updates.join(", ");
  const whereClause = whereConditions.join(" AND ");
  const allValues = [...values, ...whereValues];
  const returningClause = supportsReturning() ? "RETURNING *" : "";

  const updateSql = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}${returningClause}`;
  const stmt = db.prepare(updateSql);

  if (supportsReturning()) {
    return await stmt.get(allValues);
  } else {
    await stmt.run(allValues);
    const getStmt = db.prepare(`SELECT * FROM ${table} WHERE ${whereClause}`);
    return await getStmt.get(whereValues);
  }
}

export async function deleteAndGet(
  db: IDatabaseAdapter,
  table: string,
  whereConditions: string[],
  whereValues: any[]
): Promise<any> {
  const whereClause = whereConditions.join(" AND ");
  const returningClause = supportsReturning() ? "RETURNING *" : "";

  const deleteSql = `DELETE FROM ${table} WHERE ${whereClause}${returningClause}`;

  if (supportsReturning()) {
    const stmt = db.prepare(deleteSql);
    return await stmt.get(whereValues);
  } else {
    const getStmt = db.prepare(`SELECT * FROM ${table} WHERE ${whereClause}`);
    const item = await getStmt.get(whereValues);

    if (item) {
      const deleteStmt = db.prepare(
        `DELETE FROM ${table} WHERE ${whereClause}`
      );
      await deleteStmt.run(whereValues);
    }

    return item;
  }
}
