const sqlite3 = require("sqlite3").verbose()
const path = require("path")

// Configuración de la base de datos
const rutaBD = path.join(__dirname, "..", "bookingmap.db")

// Crear conexión a SQLite
let bd = null

async function obtenerConexion() {
  if (bd) return bd

  return new Promise((resolve, reject) => {
    bd = new sqlite3.Database(rutaBD, (error) => {
      if (error) {
        console.error("❌ Error al conectar a la base de datos SQLite:", error)
        reject(error)
      } else {
        console.log("✅ Conectado a la base de datos SQLite en:", rutaBD)
        // Habilitar claves foráneas
        bd.run("PRAGMA foreign_keys = ON")
        resolve(bd)
      }
    })
  })
}

// Función para ejecutar consultas con promesas
function ejecutarConsulta(consulta, parametros = []) {
  return new Promise((resolve, reject) => {
    if (!bd) {
      reject(new Error("Base de datos no inicializada. Llama a obtenerConexion() primero."))
      return
    }
    bd.run(consulta, parametros, function (error) {
      if (error) reject(error)
      else resolve(this)
    })
  })
}

// Función para obtener todos los registros
function obtenerTodos(consulta, parametros = []) {
  return new Promise((resolve, reject) => {
    if (!bd) {
      reject(new Error("Base de datos no inicializada. Llama a obtenerConexion() primero."))
      return
    }
    bd.all(consulta, parametros, (error, filas) => {
      if (error) reject(error)
      else resolve(filas)
    })
  })
}

// Función para obtener un solo registro
function obtenerUno(consulta, parametros = []) {
  return new Promise((resolve, reject) => {
    if (!bd) {
      reject(new Error("Base de datos no inicializada. Llama a obtenerConexion() primero."))
      return
    }
    bd.get(consulta, parametros, (error, fila) => {
      if (error) reject(error)
      else resolve(fila)
    })
  })
}

module.exports = {
  obtenerConexion,
  ejecutarConsulta,
  obtenerTodos,
  obtenerUno,
  get bd() {
    return bd
  },
}
