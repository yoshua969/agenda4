const jwt = require("jsonwebtoken")

function authenticateToken(jwtSecret) {
  return (req, res, next) => {
    const token = req.cookies.token

    if (!token) {
      return res.status(401).json({ message: "Token de acceso requerido" })
    }

    jwt.verify(token, jwtSecret, (err, user) => {
      if (err) {
        return res.status(403).json({ message: "Token inválido" })
      }
      req.user = user
      next()
    })
  }
}

function requireAdmin(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Acceso denegado. Se requieren permisos de administrador." })
  }
  next()
}

module.exports = { authenticateToken, requireAdmin }
