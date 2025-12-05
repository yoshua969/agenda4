const express = require("express")
const router = express.Router()

module.exports = (reviewController, authMiddleware) => {
  router.post("/business/:businessId", authMiddleware, (req, res) => reviewController.create(req, res))
  router.get("/business/:businessId", (req, res) => reviewController.getByBusiness(req, res))

  return router
}
