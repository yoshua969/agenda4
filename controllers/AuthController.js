const jwt = require("jsonwebtoken")

class AuthController {
  constructor(userModel, jwtSecret) {
    this.userModel = userModel
    this.jwtSecret = jwtSecret
  }

  async register(req, res) {
    const { name, email, phone, password } = req.body

    try {
      await this.userModel.create(name, email, phone, password)
      res.status(201).json({ message: "Usuario creado correctamente" })
    } catch (error) {
      if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
        return res.status(400).json({ message: "El email ya está registrado" })
      }
      console.error("Error en registro:", error)
      res.status(500).json({ message: "Error del servidor" })
    }
  }

  async login(req, res) {
    const { email, password } = req.body

    try {
      const user = await this.userModel.findByEmail(email)

      if (!user) {
        return res.status(401).json({ message: "Credenciales inválidas" })
      }

      const validPassword = await this.userModel.verifyPassword(password, user.password)
      if (!validPassword) {
        return res.status(401).json({ message: "Credenciales inválidas" })
      }

      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, this.jwtSecret, { expiresIn: "24h" })

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000,
      })

      res.json({
        message: "Login exitoso",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      })
    } catch (error) {
      console.error("Error en login:", error)
      res.status(500).json({ message: "Error del servidor" })
    }
  }

  async me(req, res) {
    try {
      const user = await this.userModel.findById(req.user.id)
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" })
      }
      res.json(user)
    } catch (error) {
      console.error("Error obteniendo usuario:", error)
      res.status(500).json({ message: "Error del servidor" })
    }
  }

  logout(req, res) {
    res.clearCookie("token")
    res.json({ message: "Logout exitoso" })
  }
}

module.exports = AuthController
