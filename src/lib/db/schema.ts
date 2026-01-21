import type { IDatabaseAdapter } from "./adapter/base";

export function initializeSchema(db: IDatabaseAdapter): void {
  const dbType = process.env.DATABASE_TYPE || "sqlite";

  const schema = getSchema(dbType);

  db.exec(schema).then(() => {
    migrateCategories(db);
    migrateCategoryToId(db, dbType);
    migrateClothingCategoryJoin(db, dbType);
  });
}

function getSchema(dbType: string): string {
  const autoIncrement =
    dbType === "mariadb"
      ? "INT AUTO_INCREMENT"
      : "INTEGER PRIMARY KEY AUTOINCREMENT";

  const primaryKey = dbType === "mariadb" ? "PRIMARY KEY" : "PRIMARY KEY";

  const references =
    dbType === "mariadb"
      ? (table: string, column: string, action: string) =>
          `REFERENCES ${table}(${column}) ON DELETE ${action}`
      : (table: string, column: string, action: string) =>
          `REFERENCES ${table}(${column}) ON DELETE ${action}`;

  return `
    CREATE TABLE IF NOT EXISTS users (
      id ${autoIncrement} ${primaryKey},
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id VARCHAR(255) ${primaryKey},
      user_id INT NOT NULL ${references("users", "id", "CASCADE")},
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_sessions_user_id (user_id),
      INDEX idx_sessions_expires_at (expires_at)
    );

    CREATE TABLE IF NOT EXISTS clothing_categories (
      id ${autoIncrement} ${primaryKey},
      user_id INT NOT NULL ${references("users", "id", "CASCADE")},
      name VARCHAR(255) NOT NULL,
      is_system TINYINT(1) NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, name),
      INDEX idx_clothing_categories_user_id (user_id)
    );

    CREATE TABLE IF NOT EXISTS clothing_items (
      id ${autoIncrement} ${primaryKey},
      user_id INT NOT NULL ${references("users", "id", "CASCADE")},
      category INT NOT NULL ${references("clothing_categories", "id", "CASCADE")},
      name VARCHAR(255) NOT NULL,
      description TEXT,
      image_path VARCHAR(255) NOT NULL,
      price DECIMAL(10, 2),
      purchase_date DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, name),
      INDEX idx_clothing_items_user_id (user_id),
      INDEX idx_clothing_items_category (category)
    );

    CREATE TABLE IF NOT EXISTS clothing_item_categories (
      clothing_item_id INT NOT NULL ${references("clothing_items", "id", "CASCADE")},
      category_id INT NOT NULL ${references("clothing_categories", "id", "CASCADE")},
      PRIMARY KEY (clothing_item_id, category_id),
      INDEX idx_clothing_item_categories_category_id (category_id),
      INDEX idx_clothing_item_categories_item_id (clothing_item_id)
    );

    CREATE TABLE IF NOT EXISTS outfits (
      id ${autoIncrement} ${primaryKey},
      user_id INT NOT NULL ${references("users", "id", "CASCADE")},
      name VARCHAR(255) NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_outfits_user_id (user_id)
    );

    CREATE TABLE IF NOT EXISTS outfit_items (
      outfit_id INT NOT NULL ${references("outfits", "id", "CASCADE")},
      clothing_id INT NOT NULL ${references("clothing_items", "id", "CASCADE")},
      PRIMARY KEY (outfit_id, clothing_id)
    );

    CREATE TABLE IF NOT EXISTS outfit_calendar (
      user_id INT NOT NULL ${references("users", "id", "CASCADE")},
      outfit_id INT NOT NULL ${references("outfits", "id", "CASCADE")},
      date DATE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, date, outfit_id),
      INDEX idx_outfit_calendar_user_date (user_id, date),
      INDEX idx_outfit_calendar_outfit_id (outfit_id)
    );
  `;
}

async function migrateCategories(db: IDatabaseAdapter): Promise<void> {
  const dbType = process.env.DATABASE_TYPE || "sqlite";

  const checkTableSql =
    dbType === "mariadb"
      ? `SELECT table_name FROM information_schema.tables WHERE table_name = 'clothing_categories'`
      : `SELECT name FROM sqlite_master WHERE type='table' AND name='clothing_categories'`;

  const tableExists = await db.query(checkTableSql);
  if (tableExists.length === 0) return;

  const checkColumnSql =
    dbType === "mariadb"
      ? `SELECT column_name FROM information_schema.columns WHERE table_name = 'clothing_categories' AND column_name = 'is_system'`
      : `SELECT name FROM pragma_table_info('clothing_categories') WHERE name = 'is_system'`;

  const columnExists = await db.query(checkColumnSql);
  if (columnExists.length === 0) return;

  const users = await db.query("SELECT id FROM users");
  const defaultCategories = [
    { name: "上装" },
    { name: "外套" },
    { name: "下装" },
    { name: "鞋子" },
    { name: "未分类" },
  ];

  for (const user of users) {
    for (const cat of defaultCategories) {
      if (dbType === "mariadb") {
        await db.query(
          "INSERT IGNORE INTO clothing_categories (user_id, name, is_system) VALUES (?, ?, 1)",
          [user.id, cat.name]
        );
      } else {
        await db.query(
          "INSERT OR IGNORE INTO clothing_categories (user_id, name, is_system) VALUES (?, ?, 1)",
          [user.id, cat.name]
        );
      }
    }
  }
}

async function migrateCategoryToId(
  db: IDatabaseAdapter,
  dbType: string
): Promise<void> {
  const checkColumnSql =
    dbType === "mariadb"
      ? `SELECT DATA_TYPE FROM information_schema.columns WHERE table_name = 'clothing_items' AND column_name = 'category'`
      : `SELECT type FROM pragma_table_info('clothing_items') WHERE name = 'category'`;

  const columns = await db.query(checkColumnSql);
  const categoryColumn = (columns as any[])[0];

  if (categoryColumn) {
    const type =
      dbType === "mariadb" ? categoryColumn.DATA_TYPE : categoryColumn.type;
    if (type === "int" || type === "INTEGER") {
      return;
    }
  }

  try {
    const createTableSql =
      dbType === "mariadb"
        ? `
        CREATE TABLE clothing_items_new (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          category INT NOT NULL REFERENCES clothing_categories(id),
          name VARCHAR(255) NOT NULL,
          description TEXT,
          image_path VARCHAR(255) NOT NULL,
          price DECIMAL(10, 2),
          purchase_date DATE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, name),
          INDEX idx_clothing_items_user_id (user_id),
          INDEX idx_clothing_items_category (category)
        );
      `
        : `
        CREATE TABLE clothing_items_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          category INTEGER NOT NULL REFERENCES clothing_categories(id),
          name TEXT NOT NULL,
          description TEXT,
          image_path TEXT NOT NULL,
          price DECIMAL(10, 2),
          purchase_date DATE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, name)
        );

        CREATE INDEX IF NOT EXISTS idx_clothing_items_user_id ON clothing_items(user_id);
        CREATE INDEX IF NOT EXISTS idx_clothing_items_category ON clothing_items(category);
      `;

    await db.exec(createTableSql);

    await db.query(`
      INSERT INTO clothing_items_new (
        id, user_id, category, name, description, image_path,
        price, purchase_date, created_at, updated_at
      )
      SELECT
        ci.id,
        ci.user_id,
        COALESCE(cc.id, 0) as category,
        ci.name,
        ci.description,
        ci.image_path,
        ci.price,
        ci.purchase_date,
        ci.created_at,
        ci.updated_at
      FROM clothing_items ci
      LEFT JOIN clothing_categories cc
        ON ci.category = cc.name AND ci.user_id = cc.user_id;
    `);

    await db.exec("DROP TABLE clothing_items");
    await db.exec("ALTER TABLE clothing_items_new RENAME TO clothing_items");

    if (dbType === "mariadb") {
      await db.exec(`
        CREATE INDEX idx_clothing_items_user_id ON clothing_items(user_id);
        CREATE INDEX idx_clothing_items_category ON clothing_items(category);
      `);
    }
  } catch (error) {
    console.error("Error migrating category to ID:", error);
  }
}

async function migrateClothingCategoryJoin(
  db: IDatabaseAdapter,
  dbType: string
): Promise<void> {
  const checkTableSql =
    dbType === "mariadb"
      ? `SELECT table_name FROM information_schema.tables WHERE table_name = 'clothing_item_categories'`
      : `SELECT name FROM sqlite_master WHERE type='table' AND name='clothing_item_categories'`;

  const tableExists = await db.query(checkTableSql);
  if (tableExists.length === 0) {
    return;
  }

  try {
    const dbType = process.env.DATABASE_TYPE || "sqlite";
    const insertSql =
      dbType === "mariadb"
        ? `INSERT IGNORE INTO clothing_item_categories (clothing_item_id, category_id)
           SELECT ci.id, ci.category
           FROM clothing_items ci
           LEFT JOIN clothing_item_categories cic
             ON cic.clothing_item_id = ci.id AND cic.category_id = ci.category
           WHERE ci.category IS NOT NULL AND cic.clothing_item_id IS NULL`
        : `INSERT OR IGNORE INTO clothing_item_categories (clothing_item_id, category_id)
           SELECT ci.id, ci.category
           FROM clothing_items ci
           LEFT JOIN clothing_item_categories cic
             ON cic.clothing_item_id = ci.id AND cic.category_id = ci.category
           WHERE ci.category IS NOT NULL AND cic.clothing_item_id IS NULL`;

    await db.exec(insertSql);
  } catch (error) {
    console.error("Error migrating clothing category join:", error);
  }
}
