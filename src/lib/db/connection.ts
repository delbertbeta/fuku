import Database from "better-sqlite3";
import path from "path";
import { initializeSchema } from "./schema";

const dbPath = process.env.DATABASE_PATH || "./data/outfit-platform.db";

let db: Database.Database | null = null;
let initialized = false;

export function getDb(): Database.Database {
  if (!db) {
    const dbDir = path.dirname(dbPath);
    const fs = require("fs");
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    db = new Database(dbPath);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");

    if (!initialized) {
      initializeSchema();
      initialized = true;
    }
  }
  return db;
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}
