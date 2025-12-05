const express = require("express")
const router = express.Router()
const ControladorAutenticacion = require("../controllers/ControladorAutenticacion")
const { verificarAutenticacion } = require("../middleware/autenticacion")

// Rutas públicas
router.post("/registrar", ControladorAutenticacion.registrar)
router.post("/iniciar-sesion", ControladorAutenticacion.iniciarSesion)

// Rutas protegidas
router.post("/cerrar-sesion", verificarAutenticacion, ControladorAutenticacion.cerrarSesion)
router.get("/yo", verificarAutenticacion, ControladorAutenticacion.obtenerUsuarioActual)

module.exports = router
