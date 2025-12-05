const Resena = require("../models/Resena")
const Negocio = require("../models/Negocio")

class ControladorResenas {
  // Crear nueva reseña
  static async crear(req, res) {
    try {
      const { id_negocio, calificacion, comentario } = req.body
      const id_usuario = req.session.usuario.id

      // Validar campos requeridos
      if (!id_negocio || !calificacion) {
        return res.status(400).json({
          mensaje: "Negocio y calificación son obligatorios",
        })
      }

      // Validar rango de calificación
      if (calificacion < 1 || calificacion > 5) {
        return res.status(400).json({
          mensaje: "La calificación debe estar entre 1 y 5",
        })
      }

      // Verificar que el negocio existe
      const negocio = await Negocio.buscarPorId(id_negocio)
      if (!negocio) {
        return res.status(404).json({
          mensaje: "Negocio no encontrado",
        })
      }

      // Verificar si ya dejó una reseña
      const resenaExistente = await Resena.verificarResenaExistente(id_negocio, id_usuario)
      if (resenaExistente) {
        return res.status(400).json({
          mensaje: "Ya dejaste una reseña para este negocio",
        })
      }

      // Crear reseña
      const idResena = await Resena.crear({
        id_negocio,
        id_usuario,
        calificacion,
        comentario,
      })

      res.status(201).json({
        mensaje: "Reseña creada exitosamente",
        id: idResena,
      })
    } catch (error) {
      console.error("Error al crear reseña:", error)
      res.status(500).json({
        mensaje: "Error al crear reseña",
      })
    }
  }

  // Obtener reseñas de un negocio
  static async obtenerPorNegocio(req, res) {
    try {
      const { id } = req.params

      const resenas = await Resena.listarPorNegocio(id)
      const estadisticas = await Resena.obtenerPromedioCalificacion(id)

      res.json({
        resenas,
        promedio: estadisticas.promedio,
        total: estadisticas.total_resenas,
      })
    } catch (error) {
      console.error("Error al obtener reseñas:", error)
      res.status(500).json({
        mensaje: "Error al obtener reseñas",
      })
    }
  }

  // Eliminar reseña
  static async eliminar(req, res) {
    try {
      const { id } = req.params

      // Solo admin puede eliminar reseñas
      if (req.session.usuario.rol !== "admin") {
        return res.status(403).json({
          mensaje: "No tienes permiso para eliminar reseñas",
        })
      }

      await Resena.eliminar(id)

      res.json({
        mensaje: "Reseña eliminada exitosamente",
      })
    } catch (error) {
      console.error("Error al eliminar reseña:", error)
      res.status(500).json({
        mensaje: "Error al eliminar reseña",
      })
    }
  }
}

module.exports = ControladorResenas
