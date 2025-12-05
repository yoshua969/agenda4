const express = require("express")
const router = express.Router()
const ControladorResenas = require("../controllers/ControladorResenas")
const { verificarAutenticacion, verificarAdmin } = require("../middleware/autenticacion")

// Rutas públicas
router.get("/negocio/:id", ControladorResenas.obtenerPorNegocio)

// Rutas protegidas
router.post("/", verificarAutenticacion, ControladorResenas.crear)
router.delete("/:id", verificarAdmin, ControladorResenas.eliminar)

module.exports = router
