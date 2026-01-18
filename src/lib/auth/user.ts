import { getDb } from "../db";

export interface User {
  id: number;
  email: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
}

export async function createUser(
  email: string,
  passwordHash: string
): Promise<User> {
  const db = getDb();
  const stmt = db.prepare(
    "INSERT INTO users (email, password_hash) VALUES (?, ?) RETURNING *"
  );
  const user = (await stmt.get([email, passwordHash])) as User;

  await createDefaultCategoriesForUser(user.id);

  return user;
}

async function createDefaultCategoriesForUser(userId: number): Promise<void> {
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
    await insertCategory.run([userId, cat.name]);
  }
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const db = getDb();
  const stmt = db.prepare("SELECT * FROM users WHERE email = ?");
  return (await stmt.get([email])) as User | undefined;
}

export async function getUserById(id: number): Promise<User | undefined> {
  const db = getDb();
  const stmt = db.prepare("SELECT * FROM users WHERE id = ?");
  return (await stmt.get([id])) as User | undefined;
}
