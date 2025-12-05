const { ejecutarConsulta, obtenerTodos, obtenerUno } = require("../config/basedatos")

class Negocio {
  static async crear(datosNegocio) {
    const {
      nombre,
      descripcion,
      categoria,
      direccion,
      latitud,
      longitud,
      telefono,
      tipo_negocio = "pyme",
      tipo = "reservable",
      id_propietario,
    } = datosNegocio

    const consulta = `
      INSERT INTO negocios (nombre, descripcion, categoria, direccion, latitud, longitud, telefono, tipo_negocio, tipo, id_propietario)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `

    const resultado = await ejecutarConsulta(consulta, [
      nombre,
      descripcion,
      categoria,
      direccion,
      latitud,
      longitud,
      telefono,
      tipo_negocio,
      tipo,
      id_propietario,
    ])

    return resultado.lastID
  }

  static async buscarPorId(id) {
    const consulta = "SELECT * FROM negocios WHERE id = ?"
    return await obtenerUno(consulta, [id])
  }

  static async listarTodos() {
    const consulta = `
      SELECT 
        n.*,
        COALESCE(AVG(r.calificacion), 0) as calificacion,
        COUNT(DISTINCT r.id) as total_resenas
      FROM negocios n
      LEFT JOIN resenas r ON n.id = r.id_negocio
      GROUP BY n.id
      ORDER BY n.fecha_creacion DESC
    `

    return await obtenerTodos(consulta)
  }

  static async listarPorPropietario(idPropietario) {
    const consulta = `
      SELECT 
        n.*,
        COALESCE(AVG(r.calificacion), 0) as calificacion,
        COUNT(DISTINCT r.id) as total_resenas
      FROM negocios n
      LEFT JOIN resenas r ON n.id = r.id_negocio
      WHERE n.id_propietario = ?
      GROUP BY n.id
      ORDER BY n.fecha_creacion DESC
    `

    return await obtenerTodos(consulta, [idPropietario])
  }

  static async buscarPorCategoria(categoria) {
    const consulta = `
      SELECT 
        n.*,
        COALESCE(AVG(r.calificacion), 0) as calificacion,
        COUNT(DISTINCT r.id) as total_resenas
      FROM negocios n
      LEFT JOIN resenas r ON n.id = r.id_negocio
      WHERE n.categoria = ?
      GROUP BY n.id
      ORDER BY n.fecha_creacion DESC
    `

    return await obtenerTodos(consulta, [categoria])
  }

  static async actualizar(id, datosNegocio) {
    const campos = []
    const valores = []

    Object.keys(datosNegocio).forEach((clave) => {
      if (datosNegocio[clave] !== undefined) {
        campos.push(`${clave} = ?`)
        valores.push(datosNegocio[clave])
      }
    })

    if (campos.length === 0) return false

    valores.push(id)
    const consulta = `UPDATE negocios SET ${campos.join(", ")} WHERE id = ?`

    const resultado = await ejecutarConsulta(consulta, valores)
    return resultado.changes > 0
  }

  static async eliminar(id) {
    const consulta = "DELETE FROM negocios WHERE id = ?"
    const resultado = await ejecutarConsulta(consulta, [id])
    return resultado.changes > 0
  }

  static async obtenerHorarios(idNegocio) {
    const consulta = "SELECT * FROM horarios_negocio WHERE id_negocio = ? ORDER BY dia_semana"
    return await obtenerTodos(consulta, [idNegocio])
  }

  static async guardarHorario(idNegocio, datosHorario) {
    const { dia_semana, hora_apertura, hora_cierre, intervalo_reserva = 30 } = datosHorario

    const consulta = `
      INSERT OR REPLACE INTO horarios_negocio (id_negocio, dia_semana, hora_apertura, hora_cierre, intervalo_reserva)
      VALUES (?, ?, ?, ?, ?)
    `

    const resultado = await ejecutarConsulta(consulta, [
      idNegocio,
      dia_semana,
      hora_apertura,
      hora_cierre,
      intervalo_reserva,
    ])
    return resultado.lastID || resultado.changes > 0
  }

  static async eliminarHorario(idNegocio, diaSemana) {
    const consulta = "DELETE FROM horarios_negocio WHERE id_negocio = ? AND dia_semana = ?"
    const resultado = await ejecutarConsulta(consulta, [idNegocio, diaSemana])
    return resultado.changes > 0
  }
}

module.exports = Negocio
