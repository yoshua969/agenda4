class BookingController {
  constructor(bookingModel, businessModel, userModel) {
    this.bookingModel = bookingModel
    this.businessModel = businessModel
    this.userModel = userModel
  }

  async create(req, res) {
    const { business_id, date, time, service, notes } = req.body
    const userId = req.user.id

    try {
      const user = await this.userModel.findById(userId)
      const business = await this.businessModel.findById(business_id)

      if (!business) {
        return res.status(404).json({ message: "Negocio no encontrado" })
      }

      const existingBookings = await this.bookingModel.getByBusinessId(business_id, date)
      const isTimeBooked = existingBookings.some((b) => b.time === time)

      if (isTimeBooked) {
        return res.status(400).json({ message: "Este horario ya no está disponible" })
      }

      await this.bookingModel.create({
        user_id: userId,
        business_id,
        business_name: business.name,
        business_address: business.address,
        user_name: user.name,
        user_email: user.email,
        date,
        time,
        service,
        notes,
      })

      res.status(201).json({ message: "Reserva creada correctamente" })
    } catch (error) {
      console.error("Error creando reserva:", error)
      res.status(500).json({ message: "Error al crear reserva" })
    }
  }

  async getAll(req, res) {
    try {
      const bookings = await this.bookingModel.getAll()
      res.json(bookings)
    } catch (error) {
      console.error("Error obteniendo reservas:", error)
      res.status(500).json({ message: "Error al cargar reservas" })
    }
  }

  async getMyBookings(req, res) {
    try {
      const bookings = await this.bookingModel.getByUserId(req.user.id)
      res.json(bookings)
    } catch (error) {
      console.error("Error obteniendo reservas:", error)
      res.status(500).json({ message: "Error al cargar reservas" })
    }
  }

  async cancel(req, res) {
    const bookingId = req.params.id

    try {
      const result = await this.bookingModel.updateStatus(bookingId, "Cancelada")

      if (result.changes === 0) {
        return res.status(404).json({ message: "Reserva no encontrada" })
      }

      res.json({ message: "Reserva cancelada correctamente" })
    } catch (error) {
      console.error("Error cancelando reserva:", error)
      res.status(500).json({ message: "Error al cancelar reserva" })
    }
  }
}

module.exports = BookingController
