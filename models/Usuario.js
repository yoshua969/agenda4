const { ejecutarConsulta, obtenerTodos, obtenerUno } = require("../config/basedatos")

class Usuario {
  // Crear nuevo usuario
  static async crear(datosUsuario) {
    const { nombre, email, telefono, contraseña, rol = "usuario" } = datosUsuario

    const consulta = `
      INSERT INTO usuarios (nombre, email, telefono, contraseña, rol)
      VALUES (?, ?, ?, ?, ?)
    `

    const resultado = await ejecutarConsulta(consulta, [nombre, email, telefono, contraseña, rol])
    return resultado.lastID
  }

  // Buscar usuario por email
  static async buscarPorEmail(email) {
    const consulta = "SELECT * FROM usuarios WHERE email = ?"
    return await obtenerUno(consulta, [email])
  }

  // Buscar usuario por ID
  static async buscarPorId(id) {
    const consulta = "SELECT id, nombre, email, telefono, rol, fecha_creacion FROM usuarios WHERE id = ?"
    return await obtenerUno(consulta, [id])
  }

  // Actualizar usuario
  static async actualizar(id, datosUsuario) {
    const campos = []
    const valores = []

    Object.keys(datosUsuario).forEach((clave) => {
      if (datosUsuario[clave] !== undefined) {
        campos.push(`${clave} = ?`)
        valores.push(datosUsuario[clave])
      }
    })

    if (campos.length === 0) return false

    valores.push(id)
    const consulta = `UPDATE usuarios SET ${campos.join(", ")} WHERE id = ?`

    const resultado = await ejecutarConsulta(consulta, valores)
    return resultado.changes > 0
  }

  // Eliminar usuario
  static async eliminar(id) {
    const consulta = "DELETE FROM usuarios WHERE id = ?"
    const resultado = await ejecutarConsulta(consulta, [id])
    return resultado.changes > 0
  }

  // Listar todos los usuarios
  static async listarTodos() {
    const consulta =
      "SELECT id, nombre, email, telefono, rol, fecha_creacion FROM usuarios ORDER BY fecha_creacion DESC"
    return await obtenerTodos(consulta)
  }
}

module.exports = Usuario
