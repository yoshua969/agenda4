const bcrypt = require("bcrypt")
const Usuario = require("../models/Usuario")

class ControladorAutenticacion {
  // Registro de usuario
  static async registrar(req, res) {
    try {
      const { nombre, email, telefono, contraseña } = req.body

      // Validar campos requeridos
      if (!nombre || !email || !contraseña) {
        return res.status(400).json({
          mensaje: "Todos los campos son obligatorios",
        })
      }

      // Verificar si el email ya existe
      const usuarioExistente = await Usuario.buscarPorEmail(email)
      if (usuarioExistente) {
        return res.status(400).json({
          mensaje: "El email ya está registrado",
        })
      }

      // Encriptar contraseña
      const contraseñaEncriptada = await bcrypt.hash(contraseña, 10)

      // Crear usuario
      const idUsuario = await Usuario.crear({
        nombre,
        email,
        telefono,
        contraseña: contraseñaEncriptada,
      })

      // Obtener datos del usuario creado
      const nuevoUsuario = await Usuario.buscarPorId(idUsuario)

      // Guardar sesión
      req.session.usuario = nuevoUsuario

      res.status(201).json({
        mensaje: "Usuario registrado exitosamente",
        usuario: nuevoUsuario,
      })
    } catch (error) {
      console.error("Error en registro:", error)
      res.status(500).json({
        mensaje: "Error al registrar usuario",
      })
    }
  }

  // Inicio de sesión
  static async iniciarSesion(req, res) {
    try {
      const { email, contraseña } = req.body

      // Validar campos
      if (!email || !contraseña) {
        return res.status(400).json({
          mensaje: "Email y contraseña son obligatorios",
        })
      }

      // Buscar usuario
      const usuario = await Usuario.buscarPorEmail(email)
      if (!usuario) {
        return res.status(401).json({
          mensaje: "Credenciales inválidas",
        })
      }

      // Verificar contraseña
      const contraseñaValida = await bcrypt.compare(contraseña, usuario.contraseña)
      if (!contraseñaValida) {
        return res.status(401).json({
          mensaje: "Credenciales inválidas",
        })
      }

      // Remover contraseña de respuesta
      delete usuario.contraseña

      // Guardar sesión
      req.session.usuario = usuario

      res.json({
        mensaje: "Inicio de sesión exitoso",
        usuario,
      })
    } catch (error) {
      console.error("Error en inicio de sesión:", error)
      res.status(500).json({
        mensaje: "Error al iniciar sesión",
      })
    }
  }

  // Cerrar sesión
  static async cerrarSesion(req, res) {
    try {
      req.session.destroy()
      res.json({
        mensaje: "Sesión cerrada exitosamente",
      })
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
      res.status(500).json({
        mensaje: "Error al cerrar sesión",
      })
    }
  }

  // Obtener usuario actual
  static async obtenerUsuarioActual(req, res) {
    try {
      if (!req.session.usuario) {
        return res.status(401).json({
          mensaje: "No autenticado",
        })
      }

      const usuario = await Usuario.buscarPorId(req.session.usuario.id)
      if (!usuario) {
        return res.status(404).json({
          mensaje: "Usuario no encontrado",
        })
      }

      res.json(usuario)
    } catch (error) {
      console.error("Error al obtener usuario:", error)
      res.status(500).json({
        mensaje: "Error al obtener datos del usuario",
      })
    }
  }
}

module.exports = ControladorAutenticacion
