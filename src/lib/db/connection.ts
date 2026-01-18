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
      initializeSchema(adapter);
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

function initializeSchema(db: IDatabaseAdapter): void {
  const { initializeSchema: initSchema } = require("./schema");
  initSchema(db);
}

export function closeDb(): void {
  if (adapter) {
    adapter.close();
    adapter = null;
  }
}
