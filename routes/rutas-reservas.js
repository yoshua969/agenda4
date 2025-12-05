const express = require("express")
const router = express.Router()
const ControladorReservas = require("../controllers/ControladorReservas")
const { verificarAutenticacion } = require("../middleware/autenticacion")

// Todas las rutas de reservas requieren autenticación
router.use(verificarAutenticacion)

router.post("/", ControladorReservas.crear)
router.get("/mis-reservas", ControladorReservas.obtenerMisReservas)
router.get("/negocio/:id", ControladorReservas.obtenerPorNegocio)
router.put("/:id/cancelar", ControladorReservas.cancelar)
router.put("/:id/estado", ControladorReservas.actualizarEstado)
router.get("/verificar-disponibilidad", ControladorReservas.verificarDisponibilidad)

module.exports = router
