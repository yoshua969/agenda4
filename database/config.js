const sqlite3 = require("sqlite3").verbose()
const path = require("path")

let db = null

async function getConnection() {
  if (db) return db

  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(
      path.join(__dirname, "../bookingmap.db"),
      sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
      (err) => {
        if (err) {
          console.error("❌ Error conectando a la base de datos:", err)
          reject(err)
        } else {
          console.log("✅ Conectado a la base de datos SQLite")
          resolve(db)
        }
      },
    )
  })
}

module.exports = { getConnection }
