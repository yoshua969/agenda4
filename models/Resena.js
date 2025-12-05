const { ejecutarConsulta, obtenerTodos, obtenerUno } = require("../config/basedatos")

class Resena {
  static async crear(datosResena) {
    const { id_negocio, id_usuario, calificacion, comentario } = datosResena

    const consulta = `
      INSERT INTO resenas (id_negocio, id_usuario, calificacion, comentario)
      VALUES (?, ?, ?, ?)
    `

    const resultado = await ejecutarConsulta(consulta, [id_negocio, id_usuario, calificacion, comentario])
    return resultado.lastID
  }

  static async verificarResenaExistente(idNegocio, idUsuario) {
    const consulta = `
      SELECT COUNT(*) as total 
      FROM resenas 
      WHERE id_negocio = ? AND id_usuario = ?
    `

    const resultado = await obtenerUno(consulta, [idNegocio, idUsuario])
    return resultado.total > 0
  }

  static async listarPorNegocio(idNegocio) {
    const consulta = `
      SELECT 
        r.*,
        u.nombre as nombre_usuario
      FROM resenas r
      JOIN usuarios u ON r.id_usuario = u.id
      WHERE r.id_negocio = ?
      ORDER BY r.fecha_creacion DESC
    `

    return await obtenerTodos(consulta, [idNegocio])
  }

  static async actualizar(id, datosResena) {
    const { calificacion, comentario } = datosResena

    const consulta = `
      UPDATE resenas 
      SET calificacion = ?, comentario = ?
      WHERE id = ?
    `

    const resultado = await ejecutarConsulta(consulta, [calificacion, comentario, id])
    return resultado.changes > 0
  }

  static async eliminar(id) {
    const consulta = "DELETE FROM resenas WHERE id = ?"
    const resultado = await ejecutarConsulta(consulta, [id])
    return resultado.changes > 0
  }

  static async obtenerPromedioCalificacion(idNegocio) {
    const consulta = `
      SELECT 
        COALESCE(AVG(calificacion), 0) as promedio,
        COUNT(*) as total_resenas
      FROM resenas
      WHERE id_negocio = ?
    `

    return await obtenerUno(consulta, [idNegocio])
  }
}

module.exports = Resena
