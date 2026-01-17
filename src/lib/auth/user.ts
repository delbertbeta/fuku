import { getDb } from "../db";

export interface User {
  id: number;
  email: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
}

export function createUser(email: string, passwordHash: string): User {
  const db = getDb();
  const stmt = db.prepare(
    "INSERT INTO users (email, password_hash) VALUES (?, ?) RETURNING *"
  );
  const user = stmt.get(email, passwordHash) as User;

  createDefaultCategoriesForUser(user.id);

  return user;
}

function createDefaultCategoriesForUser(userId: number): void {
  const db = getDb();
  const defaultCategories = [
    { name: "上装" },
    { name: "外套" },
    { name: "下装" },
    { name: "鞋子" },
    { name: "未分类" },
  ];

  const insertCategory = db.prepare(
    "INSERT INTO clothing_categories (user_id, name, is_system) VALUES (?, ?, 1)"
  );

  for (const cat of defaultCategories) {
    insertCategory.run(userId, cat.name);
  }
}

export function getUserByEmail(email: string): User | undefined {
  const db = getDb();
  const stmt = db.prepare("SELECT * FROM users WHERE email = ?");
  return stmt.get(email) as User | undefined;
}

export function getUserById(id: number): User | undefined {
  const db = getDb();
  const stmt = db.prepare("SELECT * FROM users WHERE id = ?");
  return stmt.get(id) as User | undefined;
}
