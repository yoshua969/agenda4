const Reserva = require("../models/Reserva")
const Negocio = require("../models/Negocio")

class ControladorReservas {
  // Crear nueva reserva
  static async crear(req, res) {
    try {
      const { id_negocio, fecha, hora, servicio, notas } = req.body
      const id_usuario = req.session.usuario.id

      // Validar campos requeridos
      if (!id_negocio || !fecha || !hora) {
        return res.status(400).json({
          mensaje: "Negocio, fecha y hora son obligatorios",
        })
      }

      // Verificar que el negocio existe
      const negocio = await Negocio.buscarPorId(id_negocio)
      if (!negocio) {
        return res.status(404).json({
          mensaje: "Negocio no encontrado",
        })
      }

      // Verificar disponibilidad
      const disponible = await Reserva.verificarDisponibilidad(id_negocio, fecha, hora)
      if (!disponible) {
        return res.status(400).json({
          mensaje: "Este horario ya está reservado",
        })
      }

      // Crear reserva
      const idReserva = await Reserva.crear({
        id_negocio,
        id_usuario,
        fecha,
        hora,
        servicio,
        notas,
      })

      const reserva = await Reserva.buscarPorId(idReserva)

      res.status(201).json({
        mensaje: "Reserva creada exitosamente",
        reserva,
      })
    } catch (error) {
      console.error("Error al crear reserva:", error)
      res.status(500).json({
        mensaje: "Error al crear reserva",
      })
    }
  }

  // Obtener reservas del usuario actual
  static async obtenerMisReservas(req, res) {
    try {
      const idUsuario = req.session.usuario.id
      const reservas = await Reserva.listarPorUsuario(idUsuario)

      res.json(reservas)
    } catch (error) {
      console.error("Error al obtener reservas:", error)
      res.status(500).json({
        mensaje: "Error al obtener reservas",
      })
    }
  }

  // Obtener reservas de un negocio
  static async obtenerPorNegocio(req, res) {
    try {
      const { id } = req.params
      const { estado } = req.query

      // Verificar permisos
      const negocio = await Negocio.buscarPorId(id)
      if (!negocio) {
        return res.status(404).json({
          mensaje: "Negocio no encontrado",
        })
      }

      if (negocio.id_propietario !== req.session.usuario.id && req.session.usuario.rol !== "admin") {
        return res.status(403).json({
          mensaje: "No tienes permiso para ver estas reservas",
        })
      }

      const reservas = await Reserva.listarPorNegocio(id, estado)

      res.json(reservas)
    } catch (error) {
      console.error("Error al obtener reservas:", error)
      res.status(500).json({
        mensaje: "Error al obtener reservas",
      })
    }
  }

  // Cancelar reserva
  static async cancelar(req, res) {
    try {
      const { id } = req.params
      const reserva = await Reserva.buscarPorId(id)

      if (!reserva) {
        return res.status(404).json({
          mensaje: "Reserva no encontrada",
        })
      }

      // Verificar permisos
      if (reserva.id_usuario !== req.session.usuario.id && req.session.usuario.rol !== "admin") {
        return res.status(403).json({
          mensaje: "No tienes permiso para cancelar esta reserva",
        })
      }

      await Reserva.cancelar(id)

      res.json({
        mensaje: "Reserva cancelada exitosamente",
      })
    } catch (error) {
      console.error("Error al cancelar reserva:", error)
      res.status(500).json({
        mensaje: "Error al cancelar reserva",
      })
    }
  }

  // Actualizar estado de reserva
  static async actualizarEstado(req, res) {
    try {
      const { id } = req.params
      const { estado } = req.body

      const reserva = await Reserva.buscarPorId(id)
      if (!reserva) {
        return res.status(404).json({
          mensaje: "Reserva no encontrada",
        })
      }

      // Verificar permisos (solo el negocio puede cambiar estados)
      const negocio = await Negocio.buscarPorId(reserva.id_negocio)
      if (negocio.id_propietario !== req.session.usuario.id && req.session.usuario.rol !== "admin") {
        return res.status(403).json({
          mensaje: "No tienes permiso para actualizar esta reserva",
        })
      }

      await Reserva.actualizarEstado(id, estado)

      res.json({
        mensaje: "Estado de reserva actualizado exitosamente",
      })
    } catch (error) {
      console.error("Error al actualizar estado:", error)
      res.status(500).json({
        mensaje: "Error al actualizar estado",
      })
    }
  }

  // Verificar disponibilidad
  static async verificarDisponibilidad(req, res) {
    try {
      const { idNegocio, fecha, hora } = req.query

      if (!idNegocio || !fecha || !hora) {
        return res.status(400).json({
          mensaje: "Parámetros incompletos",
        })
      }

      const disponible = await Reserva.verificarDisponibilidad(idNegocio, fecha, hora)

      res.json({ disponible })
    } catch (error) {
      console.error("Error al verificar disponibilidad:", error)
      res.status(500).json({
        mensaje: "Error al verificar disponibilidad",
      })
    }
  }
}

module.exports = ControladorReservas
