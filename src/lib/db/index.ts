import { getDb, closeDb } from "./connection";
import { initializeSchema } from "./schema";
import type { IDatabaseAdapter } from "./adapter/base";

export { getDb, closeDb, initializeSchema, IDatabaseAdapter };
