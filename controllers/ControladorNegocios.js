const Negocio = require("../models/Negocio")

class ControladorNegocios {
  // Crear nuevo negocio
  static async crear(req, res) {
    try {
      const datosNegocio = {
        ...req.body,
        id_propietario: req.session.usuario.id,
      }

      const idNegocio = await Negocio.crear(datosNegocio)
      const negocio = await Negocio.buscarPorId(idNegocio)

      res.status(201).json({
        mensaje: "Negocio creado exitosamente",
        negocio,
      })
    } catch (error) {
      console.error("Error al crear negocio:", error)
      res.status(500).json({
        mensaje: "Error al crear negocio",
      })
    }
  }

  // Obtener todos los negocios
  static async listarTodos(req, res) {
    try {
      const negocios = await Negocio.listarTodos()

      // Obtener horarios para cada negocio
      const negociosConHorarios = await Promise.all(
        negocios.map(async (negocio) => {
          const horarios = await Negocio.obtenerHorarios(negocio.id)
          return { ...negocio, horarios }
        }),
      )

      res.json(negociosConHorarios)
    } catch (error) {
      console.error("Error al listar negocios:", error)
      res.status(500).json({
        mensaje: "Error al obtener negocios",
      })
    }
  }

  // Obtener negocio por ID
  static async obtenerPorId(req, res) {
    try {
      const { id } = req.params
      const negocio = await Negocio.buscarPorId(id)

      if (!negocio) {
        return res.status(404).json({
          mensaje: "Negocio no encontrado",
        })
      }

      const horarios = await Negocio.obtenerHorarios(id)
      res.json({ ...negocio, horarios })
    } catch (error) {
      console.error("Error al obtener negocio:", error)
      res.status(500).json({
        mensaje: "Error al obtener negocio",
      })
    }
  }

  // Obtener negocios del usuario actual
  static async obtenerMisNegocios(req, res) {
    try {
      const idUsuario = req.session.usuario.id
      const negocios = await Negocio.listarPorPropietario(idUsuario)

      // Obtener horarios para cada negocio
      const negociosConHorarios = await Promise.all(
        negocios.map(async (negocio) => {
          const horarios = await Negocio.obtenerHorarios(negocio.id)
          return { ...negocio, horarios }
        }),
      )

      res.json(negociosConHorarios)
    } catch (error) {
      console.error("Error al obtener negocios:", error)
      res.status(500).json({
        mensaje: "Error al obtener negocios",
      })
    }
  }

  // Actualizar negocio
  static async actualizar(req, res) {
    try {
      const { id } = req.params
      const negocio = await Negocio.buscarPorId(id)

      if (!negocio) {
        return res.status(404).json({
          mensaje: "Negocio no encontrado",
        })
      }

      // Verificar permisos
      if (negocio.id_propietario !== req.session.usuario.id && req.session.usuario.rol !== "admin") {
        return res.status(403).json({
          mensaje: "No tienes permiso para actualizar este negocio",
        })
      }

      await Negocio.actualizar(id, req.body)
      const negocioActualizado = await Negocio.buscarPorId(id)

      res.json({
        mensaje: "Negocio actualizado exitosamente",
        negocio: negocioActualizado,
      })
    } catch (error) {
      console.error("Error al actualizar negocio:", error)
      res.status(500).json({
        mensaje: "Error al actualizar negocio",
      })
    }
  }

  // Eliminar negocio
  static async eliminar(req, res) {
    try {
      const { id } = req.params
      const negocio = await Negocio.buscarPorId(id)

      if (!negocio) {
        return res.status(404).json({
          mensaje: "Negocio no encontrado",
        })
      }

      // Verificar permisos
      if (negocio.id_propietario !== req.session.usuario.id && req.session.usuario.rol !== "admin") {
        return res.status(403).json({
          mensaje: "No tienes permiso para eliminar este negocio",
        })
      }

      await Negocio.eliminar(id)

      res.json({
        mensaje: "Negocio eliminado exitosamente",
      })
    } catch (error) {
      console.error("Error al eliminar negocio:", error)
      res.status(500).json({
        mensaje: "Error al eliminar negocio",
      })
    }
  }

  // Guardar horarios
  static async guardarHorarios(req, res) {
    try {
      const { id } = req.params
      const { horarios } = req.body

      const negocio = await Negocio.buscarPorId(id)
      if (!negocio) {
        return res.status(404).json({
          mensaje: "Negocio no encontrado",
        })
      }

      // Verificar permisos
      if (negocio.id_propietario !== req.session.usuario.id && req.session.usuario.rol !== "admin") {
        return res.status(403).json({
          mensaje: "No tienes permiso para modificar este negocio",
        })
      }

      // Guardar cada horario
      for (const horario of horarios) {
        await Negocio.guardarHorario(id, horario)
      }

      const horariosActualizados = await Negocio.obtenerHorarios(id)

      res.json({
        mensaje: "Horarios guardados exitosamente",
        horarios: horariosActualizados,
      })
    } catch (error) {
      console.error("Error al guardar horarios:", error)
      res.status(500).json({
        mensaje: "Error al guardar horarios",
      })
    }
  }
}

module.exports = ControladorNegocios
