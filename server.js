const express = require("express")
const cookieParser = require("cookie-parser")
const path = require("path")
require("dotenv").config()

// Database
const { getConnection } = require("./database/config")
const { initializeDatabase } = require("./database/init")

// Models
const User = require("./models/User")
const Business = require("./models/Business")
const Booking = require("./models/Booking")
const Review = require("./models/Review")

// Controllers
const AuthController = require("./controllers/AuthController")
const BusinessController = require("./controllers/BusinessController")
const BookingController = require("./controllers/BookingController")
const ReviewController = require("./controllers/ReviewController")

// Middleware
const { authenticateToken, requireAdmin } = require("./middleware/auth")

// Routes
const authRoutes = require("./routes/auth.routes")
const businessRoutes = require("./routes/business.routes")
const bookingRoutes = require("./routes/booking.routes")
const reviewRoutes = require("./routes/review.routes")

const app = express()
const PORT = process.env.PORT || 3000
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-here"

// Middleware
app.use(express.json())
app.use(cookieParser())
app.use(express.static("public"))

// Initialize app
async function startServer() {
  try {
    // Get database connection
    const db = await getConnection()

    // Initialize database tables
    await initializeDatabase(db)

    // Initialize models
    const userModel = new User(db)
    const businessModel = new Business(db)
    const bookingModel = new Booking(db)
    const reviewModel = new Review(db)

    // Initialize controllers
    const authController = new AuthController(userModel, JWT_SECRET)
    const businessController = new BusinessController(businessModel, reviewModel, bookingModel)
    const bookingController = new BookingController(bookingModel, businessModel, userModel)
    const reviewController = new ReviewController(reviewModel)

    // Setup middleware with JWT secret
    const authMiddleware = authenticateToken(JWT_SECRET)

    // Setup routes
    app.use("/api/auth", authRoutes(authController, authMiddleware))
    app.use("/api/businesses", businessRoutes(businessController, authMiddleware, requireAdmin))
    app.use("/api/bookings", bookingRoutes(bookingController, authMiddleware, requireAdmin))
    app.use("/api/reviews", reviewRoutes(reviewController, authMiddleware))

    // Start server
    app.listen(PORT, () => {
      console.log(`✅ Servidor corriendo en http://localhost:${PORT}`)
    })
  } catch (error) {
    console.error("❌ Error iniciando el servidor:", error)
    process.exit(1)
  }
}

startServer()
