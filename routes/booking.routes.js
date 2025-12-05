const express = require("express")
const router = express.Router()

module.exports = (bookingController, authMiddleware, adminMiddleware) => {
  router.post("/", authMiddleware, (req, res) => bookingController.create(req, res))
  router.get("/", authMiddleware, adminMiddleware, (req, res) => bookingController.getAll(req, res))
  router.get("/my-bookings", authMiddleware, (req, res) => bookingController.getMyBookings(req, res))
  router.put("/:id/cancel", authMiddleware, (req, res) => bookingController.cancel(req, res))

  return router
}
