import { getDb } from "../db";

export interface Session {
  id: string;
  user_id: number;
  expires_at: string;
  created_at: string;
}

export async function createSession(
  userId: number,
  expiresInHours = 24
): Promise<Session> {
  const db = getDb();
  const sessionId = generateSessionId();
  const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);
  const dbType = process.env.DATABASE_TYPE || "sqlite";

  const dateFormat = (date: Date) => {
    if (dbType === "mariadb") {
      return date.toISOString().slice(0, 19).replace("T", " ");
    }
    return date.toISOString();
  };

  const stmt = db.prepare(
    "INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)"
  );
  await stmt.run([sessionId, userId, dateFormat(expiresAt)]);

  return {
    id: sessionId,
    user_id: userId,
    expires_at: dateFormat(expiresAt),
    created_at: dateFormat(new Date()),
  };
}

export async function getSession(
  sessionId: string
): Promise<Session | undefined> {
  const db = getDb();
  const dbType = process.env.DATABASE_TYPE || "sqlite";

  const nowClause = dbType === "mariadb" ? "NOW()" : "datetime('now')";

  const stmt = db.prepare(
    `SELECT * FROM sessions WHERE id = ? AND expires_at > ${nowClause}`
  );
  return (await stmt.get([sessionId])) as Session | undefined;
}

export async function deleteSession(sessionId: string): Promise<void> {
  const db = getDb();
  const stmt = db.prepare("DELETE FROM sessions WHERE id = ?");
  await stmt.run([sessionId]);
}

export async function deleteAllUserSessions(userId: number): Promise<void> {
  const db = getDb();
  const stmt = db.prepare("DELETE FROM sessions WHERE user_id = ?");
  await stmt.run([userId]);
}

function generateSessionId(): string {
  return crypto.randomUUID();
}
