import { getDb } from "./connection";
import Database from "better-sqlite3";

export function initializeSchema(): void {
  const db = getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS clothing_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      is_system INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, name)
    );

    CREATE TABLE IF NOT EXISTS clothing_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      category TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      image_path TEXT NOT NULL,
      price DECIMAL(10, 2),
      purchase_date DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, name)
    );

    CREATE TABLE IF NOT EXISTS outfits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS outfit_items (
      outfit_id INTEGER NOT NULL REFERENCES outfits(id) ON DELETE CASCADE,
      clothing_id INTEGER NOT NULL REFERENCES clothing_items(id) ON DELETE CASCADE,
      PRIMARY KEY (outfit_id, clothing_id)
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
    CREATE INDEX IF NOT EXISTS idx_clothing_items_user_id ON clothing_items(user_id);
    CREATE INDEX IF NOT EXISTS idx_clothing_items_category ON clothing_items(category);
    CREATE INDEX IF NOT EXISTS idx_outfits_user_id ON outfits(user_id);
    CREATE INDEX IF NOT EXISTS idx_clothing_categories_user_id ON clothing_categories(user_id);
  `);

  migrateCategories(db);
}

function migrateCategories(db: Database.Database): void {
  const tableExists = db
    .prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='clothing_categories'"
    )
    .get();

  if (!tableExists) return;

  const columnExists = db
    .prepare("PRAGMA table_info(clothing_categories)")
    .all()
    .some((col: any) => col.name === "is_system");

  if (columnExists) {
    const users = db.prepare("SELECT id FROM users").all() as any[];
    const defaultCategories = [
      { name: "上装" },
      { name: "外套" },
      { name: "下装" },
      { name: "鞋子" },
      { name: "未分类" },
    ];

    const insertCategory = db.prepare(
      "INSERT OR IGNORE INTO clothing_categories (user_id, name, is_system) VALUES (?, ?, 1)"
    );

    for (const user of users) {
      for (const cat of defaultCategories) {
        insertCategory.run(user.id, cat.name);
      }
    }
  }
}
