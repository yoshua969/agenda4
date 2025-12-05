class BusinessController {
  constructor(businessModel, reviewModel, bookingModel) {
    this.businessModel = businessModel
    this.reviewModel = reviewModel
    this.bookingModel = bookingModel
  }

  async getAll(req, res) {
    try {
      const businesses = await this.businessModel.getAll()

      const businessesWithRatings = await Promise.all(
        businesses.map(async (business) => {
          const services = business.services ? JSON.parse(business.services) : null
          const ratings = await this.reviewModel.getAverageRating(business.id)
          const avgRating = ratings.avg_rating ? Number.parseFloat(ratings.avg_rating).toFixed(1) : null
          const reviewCount = ratings.review_count || 0

          return {
            ...business,
            services,
            avg_rating: avgRating,
            review_count: reviewCount,
          }
        }),
      )

      res.json(businessesWithRatings)
    } catch (error) {
      console.error("Error obteniendo negocios:", error)
      res.status(500).json({ message: "Error al cargar negocios" })
    }
  }

  async create(req, res) {
    const { name, category, type, business_type, lat, lng, address, phone, services, schedules, booking_interval } =
      req.body

    try {
      console.log("[v0] Creating business with data:", {
        name,
        category,
        type,
        business_type,
        lat,
        lng,
        address,
        phone,
      })

      if (!name || !category || !type || !business_type || !lat || !lng || !address || !phone) {
        return res.status(400).json({
          message: "Faltan campos requeridos",
          missing: {
            name: !name,
            category: !category,
            type: !type,
            business_type: !business_type,
            lat: !lat,
            lng: !lng,
            address: !address,
            phone: !phone,
          },
        })
      }

      const servicesJson = services ? JSON.stringify(services) : null
      const hoursText = schedules && schedules.length > 0 ? "Ver horarios detallados" : "Horarios no especificados"

      const result = await this.businessModel.create({
        name,
        category,
        type,
        business_type,
        lat,
        lng,
        address,
        phone,
        hours: hoursText,
        services: servicesJson,
      })

      const businessId = result.id

      if (schedules && schedules.length > 0) {
        for (const schedule of schedules) {
          await this.businessModel.createSchedule(businessId, {
            ...schedule,
            booking_interval: schedule.booking_interval || booking_interval || 30,
          })
        }
      }

      console.log("[v0] Business created successfully with ID:", businessId)
      res.status(201).json({ message: "Negocio creado correctamente", businessId })
    } catch (error) {
      console.error("Error creando negocio:", error)
      res.status(500).json({ message: "Error al crear negocio", error: error.message })
    }
  }

  async delete(req, res) {
    const businessId = req.params.id

    try {
      const result = await this.businessModel.delete(businessId)

      if (result.changes === 0) {
        return res.status(404).json({ message: "Negocio no encontrado" })
      }

      res.json({ message: "Negocio eliminado correctamente" })
    } catch (error) {
      console.error("Error eliminando negocio:", error)
      res.status(500).json({ message: "Error al eliminar negocio" })
    }
  }

  async getSchedules(req, res) {
    const businessId = req.params.id

    try {
      const schedules = await this.businessModel.getSchedules(businessId)
      res.json(schedules)
    } catch (error) {
      console.error("Error obteniendo horarios:", error)
      res.status(500).json({ message: "Error al cargar horarios" })
    }
  }

  async getAvailableTimes(req, res) {
    const businessId = req.params.id
    const date = req.query.date

    try {
      const business = await this.businessModel.findById(businessId)
      if (!business) {
        return res.status(404).json({ message: "Negocio no encontrado" })
      }

      const schedules = await this.businessModel.getSchedules(businessId)

      const requestedDate = new Date(date + "T00:00:00")
      const dayOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][
        requestedDate.getDay()
      ]

      const schedule = schedules.find((s) => s.day_of_week === dayOfWeek && s.is_open)

      if (!schedule) {
        return res.json([])
      }

      const bookings = await this.bookingModel.getByBusinessId(businessId, date)
      const bookedTimes = bookings.map((b) => b.time)

      const availableTimes = this.generateTimeSlots(
        schedule.open_time,
        schedule.close_time,
        schedule.booking_interval || 30,
        bookedTimes,
      )

      res.json(availableTimes)
    } catch (error) {
      console.error("Error obteniendo horarios disponibles:", error)
      res.status(500).json({ message: "Error al cargar horarios disponibles" })
    }
  }

  generateTimeSlots(openTime, closeTime, interval, bookedTimes) {
    const slots = []
    const [openHour, openMinute] = openTime.split(":").map(Number)
    const [closeHour, closeMinute] = closeTime.split(":").map(Number)

    let currentHour = openHour
    let currentMinute = openMinute

    while (currentHour < closeHour || (currentHour === closeHour && currentMinute < closeMinute)) {
      const timeStr = `${String(currentHour).padStart(2, "0")}:${String(currentMinute).padStart(2, "0")}`

      if (!bookedTimes.includes(timeStr)) {
        slots.push(timeStr)
      }

      currentMinute += interval
      if (currentMinute >= 60) {
        currentHour += Math.floor(currentMinute / 60)
        currentMinute = currentMinute % 60
      }
    }

    return slots
  }
}

module.exports = BusinessController
