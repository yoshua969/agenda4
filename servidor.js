const express = require("express")
const cookieParser = require("cookie-parser")
const path = require("path")
require("dotenv").config()

const { obtenerConexion } = require("./config/basedatos")
const { inicializarBaseDatos } = require("./database/inicializar")

// Rutas
const rutasAutenticacion = require("./routes/rutas-autenticacion")
const rutasNegocios = require("./routes/rutas-negocios")
const rutasReservas = require("./routes/rutas-reservas")
const rutasResenas = require("./routes/rutas-resenas")

const app = express()
const PUERTO = process.env.PORT || 3000

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(express.static("public"))

async function iniciarServidor() {
  try {
    console.log("📊 Conectando a base de datos SQLite...")
    await obtenerConexion()

    console.log("🔧 Inicializando tablas...")
    await inicializarBaseDatos()

    // Configurar rutas API
    app.use("/api/autenticacion", rutasAutenticacion)
    app.use("/api/negocios", rutasNegocios)
    app.use("/api/reservas", rutasReservas)
    app.use("/api/resenas", rutasResenas)

    // Ruta principal
    app.get("/", (req, res) => {
      res.sendFile(path.join(__dirname, "public", "index.html"))
    })

    // Iniciar servidor
    app.listen(PUERTO, () => {
      console.log(`\n🚀 ========================================`)
      console.log(`✅ Servidor BookingMap Chile corriendo`)
      console.log(`📍 URL: http://localhost:${PUERTO}`)
      console.log(`💾 Base de datos: SQLite (bookingmap.db)`)
      console.log(`📐 Arquitectura: MVC`)
      console.log(`🗺️  Mapa: Leaflet + OpenStreetMap`)
      console.log(`========================================\n`)
    })
  } catch (error) {
    console.error("❌ Error iniciando el servidor:", error)
    process.exit(1)
  }
}

iniciarServidor()
