import { getDb } from '../src/lib/db';

const db = getDb();
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Tables:', tables);
