class ReviewController {
  constructor(reviewModel) {
    this.reviewModel = reviewModel
  }

  async create(req, res) {
    const businessId = req.params.businessId
    const { rating, comment } = req.body
    const userId = req.user.id

    try {
      console.log("[v0] Creating review:", { businessId, userId, rating, comment })

      if (!businessId) {
        return res.status(400).json({ message: "business_id es requerido" })
      }

      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: "La calificación debe estar entre 1 y 5" })
      }

      await this.reviewModel.create({
        business_id: businessId,
        user_id: userId,
        rating,
        comment,
      })

      res.status(201).json({ message: "Reseña creada correctamente" })
    } catch (error) {
      console.error("Error creando reseña:", error)
      res.status(500).json({ message: "Error al crear reseña" })
    }
  }

  async getByBusiness(req, res) {
    const businessId = req.params.businessId

    try {
      const reviews = await this.reviewModel.getByBusinessId(businessId)
      res.json(reviews)
    } catch (error) {
      console.error("Error obteniendo reseñas:", error)
      res.status(500).json({ message: "Error al cargar reseñas" })
    }
  }
}

module.exports = ReviewController
