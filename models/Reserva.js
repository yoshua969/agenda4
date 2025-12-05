const { ejecutarConsulta, obtenerTodos, obtenerUno } = require("../config/basedatos")

class Reserva {
  static async crear(datosReserva) {
    const { id_negocio, id_usuario, fecha, hora, servicio, notas, estado = "Confirmada" } = datosReserva

    const consulta = `
      INSERT INTO reservas (id_negocio, id_usuario, fecha, hora, servicio, notas, estado)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `

    const resultado = await ejecutarConsulta(consulta, [id_negocio, id_usuario, fecha, hora, servicio, notas, estado])
    return resultado.lastID
  }

  static async verificarDisponibilidad(idNegocio, fecha, hora) {
    const consulta = `
      SELECT COUNT(*) as total 
      FROM reservas 
      WHERE id_negocio = ? 
        AND fecha = ? 
        AND hora = ? 
        AND estado != 'Cancelada'
    `

    const resultado = await obtenerUno(consulta, [idNegocio, fecha, hora])
    return resultado.total === 0
  }

  static async buscarPorId(id) {
    const consulta = `
      SELECT 
        r.*,
        n.nombre as nombre_negocio,
        n.direccion as direccion_negocio,
        u.nombre as nombre_usuario,
        u.email as email_usuario,
        u.telefono as telefono_usuario
      FROM reservas r
      JOIN negocios n ON r.id_negocio = n.id
      JOIN usuarios u ON r.id_usuario = u.id
      WHERE r.id = ?
    `

    return await obtenerUno(consulta, [id])
  }

  static async listarPorNegocio(idNegocio, estado = null) {
    let consulta = `
      SELECT 
        r.*,
        u.nombre as nombre_usuario,
        u.email as email_usuario,
        u.telefono as telefono_usuario
      FROM reservas r
      JOIN usuarios u ON r.id_usuario = u.id
      WHERE r.id_negocio = ?
    `

    const parametros = [idNegocio]

    if (estado) {
      consulta += " AND r.estado = ?"
      parametros.push(estado)
    }

    consulta += " ORDER BY r.fecha DESC, r.hora DESC"

    return await obtenerTodos(consulta, parametros)
  }

  static async listarPorUsuario(idUsuario) {
    const consulta = `
      SELECT 
        r.*,
        n.nombre as nombre_negocio,
        n.direccion as direccion_negocio,
        n.telefono as telefono_negocio
      FROM reservas r
      JOIN negocios n ON r.id_negocio = n.id
      WHERE r.id_usuario = ?
      ORDER BY r.fecha DESC, r.hora DESC
    `

    return await obtenerTodos(consulta, [idUsuario])
  }

  static async actualizarEstado(id, estado) {
    const consulta = "UPDATE reservas SET estado = ? WHERE id = ?"
    const resultado = await ejecutarConsulta(consulta, [estado, id])
    return resultado.changes > 0
  }

  static async cancelar(id) {
    return this.actualizarEstado(id, "Cancelada")
  }

  static async eliminar(id) {
    const consulta = "DELETE FROM reservas WHERE id = ?"
    const resultado = await ejecutarConsulta(consulta, [id])
    return resultado.changes > 0
  }

  static async obtenerReservasHoy(idNegocio) {
    const consulta = `
      SELECT 
        r.*,
        u.nombre as nombre_usuario,
        u.telefono as telefono_usuario
      FROM reservas r
      JOIN usuarios u ON r.id_usuario = u.id
      WHERE r.id_negocio = ? 
        AND r.fecha = date('now')
        AND r.estado = 'Confirmada'
      ORDER BY r.hora
    `

    return await obtenerTodos(consulta, [idNegocio])
  }
}

module.exports = Reserva
