const express = require("express")
const router = express.Router()
const ControladorNegocios = require("../controllers/ControladorNegocios")
const { verificarAutenticacion, verificarAdmin } = require("../middleware/autenticacion")

// Rutas públicas
router.get("/", ControladorNegocios.listarTodos)
router.get("/:id", ControladorNegocios.obtenerPorId)

// Rutas protegidas
router.get("/mis-negocios/listar", verificarAutenticacion, ControladorNegocios.obtenerMisNegocios)
router.post("/", verificarAdmin, ControladorNegocios.crear)
router.put("/:id", verificarAdmin, ControladorNegocios.actualizar)
router.delete("/:id", verificarAdmin, ControladorNegocios.eliminar)
router.post("/:id/horarios", verificarAdmin, ControladorNegocios.guardarHorarios)

module.exports = router
