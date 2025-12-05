const mysql = require("mysql2/promise")

// Configuración de la base de datos
const configuracionBD = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "bookingmap_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}

// Crear pool de conexiones
const pool = mysql.createPool(configuracionBD)

// Probar conexión
pool
  .getConnection()
  .then((conexion) => {
    console.log("✅ Conectado a la base de datos MySQL")
    conexion.release()
  })
  .catch((error) => {
    console.error("❌ Error al conectar a la base de datos:", error)
  })

module.exports = pool
