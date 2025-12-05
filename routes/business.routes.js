const express = require("express")
const router = express.Router()

module.exports = (businessController, authMiddleware, adminMiddleware) => {
  router.get("/", (req, res) => businessController.getAll(req, res))
  router.post("/", authMiddleware, adminMiddleware, (req, res) => businessController.create(req, res))
  router.delete("/:id", authMiddleware, adminMiddleware, (req, res) => businessController.delete(req, res))
  router.get("/:id/schedules", (req, res) => businessController.getSchedules(req, res))
  router.get("/:id/available-times", (req, res) => businessController.getAvailableTimes(req, res))

  return router
}
