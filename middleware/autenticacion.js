// Middleware para verificar autenticación
const verificarAutenticacion = (req, res, next) => {
  if (!req.session.usuario) {
    return res.status(401).json({
      mensaje: "Debes iniciar sesión para acceder a este recurso",
    })
  }
  next()
}

// Middleware para verificar rol de administrador
const verificarAdmin = (req, res, next) => {
  if (!req.session.usuario) {
    return res.status(401).json({
      mensaje: "Debes iniciar sesión para acceder a este recurso",
    })
  }

  if (req.session.usuario.rol !== "admin") {
    return res.status(403).json({
      mensaje: "No tienes permisos de administrador",
    })
  }

  next()
}

module.exports = {
  verificarAutenticacion,
  verificarAdmin,
}
