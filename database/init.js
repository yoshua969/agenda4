const bcrypt = require("bcryptjs")

async function initializeDatabase(db) {
  try {
    await createTables(db)
    await createAdminUser(db)
    console.log("✅ Base de datos inicializada correctamente")
  } catch (err) {
    console.error("❌ Error inicializando la base de datos:", err)
    throw err
  }
}

function runQuery(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err)
      else resolve({ lastID: this.lastID, changes: this.changes })
    })
  })
}

function getQuery(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err)
      else resolve(rows)
    })
  })
}

async function createTables(db) {
  await runQuery(
    db,
    `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `,
  )

  await runQuery(
    db,
    `
    CREATE TABLE IF NOT EXISTS businesses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      type TEXT NOT NULL,
      business_type TEXT DEFAULT 'pyme',
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      address TEXT NOT NULL,
      phone TEXT NOT NULL,
      hours TEXT,
      services TEXT,
      rating REAL DEFAULT 4.0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `,
  )

  await runQuery(
    db,
    `
    CREATE TABLE IF NOT EXISTS business_schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      business_id INTEGER NOT NULL,
      day_of_week TEXT NOT NULL,
      is_open INTEGER DEFAULT 1,
      open_time TEXT,
      close_time TEXT,
      booking_interval INTEGER DEFAULT 30,
      FOREIGN KEY (business_id) REFERENCES businesses (id) ON DELETE CASCADE
    )
  `,
  )

  await runQuery(
    db,
    `
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      business_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      rating INTEGER NOT NULL,
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (business_id) REFERENCES businesses (id),
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `,
  )

  await runQuery(
    db,
    `
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      business_id INTEGER NOT NULL,
      business_name TEXT NOT NULL,
      business_address TEXT NOT NULL,
      user_name TEXT NOT NULL,
      user_email TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      service TEXT,
      notes TEXT,
      status TEXT DEFAULT 'Confirmada',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (business_id) REFERENCES businesses (id)
    )
  `,
  )

  console.log("✅ Tablas creadas correctamente")
}

async function createAdminUser(db) {
  try {
    const adminPassword = await bcrypt.hash("admin123", 10)
    const existingAdmin = await getQuery(db, "SELECT id FROM users WHERE email = ?", ["admin@bookingmap.cl"])

    if (existingAdmin.length === 0) {
      await runQuery(db, "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)", [
        "Administrador",
        "admin@bookingmap.cl",
        adminPassword,
        "admin",
      ])
      console.log("✅ Usuario administrador creado")
    }
  } catch (err) {
    console.error("Error creando usuario admin:", err)
  }
}

module.exports = { initializeDatabase }
