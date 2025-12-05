const express = require("express")
const router = express.Router()

module.exports = (authController, authMiddleware) => {
  router.post("/register", (req, res) => authController.register(req, res))
  router.post("/login", (req, res) => authController.login(req, res))
  router.get("/me", authMiddleware, (req, res) => authController.me(req, res))
  router.post("/logout", (req, res) => authController.logout(req, res))

  return router
}
