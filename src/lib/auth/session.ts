import { getDb } from "../db";

export interface Session {
  id: string;
  user_id: number;
  expires_at: string;
  created_at: string;
}

export function createSession(userId: number, expiresInHours = 24): Session {
  const db = getDb();
  const sessionId = generateSessionId();
  const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

  const stmt = db.prepare(
    "INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?) RETURNING *"
  );
  const session = stmt.get(
    sessionId,
    userId,
    expiresAt.toISOString()
  ) as Session;
  return session;
}

export function getSession(sessionId: string): Session | undefined {
  const db = getDb();
  const stmt = db.prepare(
    "SELECT * FROM sessions WHERE id = ? AND expires_at > datetime('now')"
  );
  return stmt.get(sessionId) as Session | undefined;
}

export function deleteSession(sessionId: string): void {
  const db = getDb();
  const stmt = db.prepare("DELETE FROM sessions WHERE id = ?");
  stmt.run(sessionId);
}

export function deleteAllUserSessions(userId: number): void {
  const db = getDb();
  const stmt = db.prepare("DELETE FROM sessions WHERE user_id = ?");
  stmt.run(userId);
}

function generateSessionId(): string {
  return crypto.randomUUID();
}
