console.log("[v0] Initializing user panel...")

const API_BASE = "/api"
let currentUser = null

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  console.log("[v0] DOM loaded")
  checkAuth()
  setupEventListeners()
})

// Check authentication
async function checkAuth() {
  console.log("[v0] Checking auth...")
  try {
    const response = await fetch(`${API_BASE}/auth/me`, {
      credentials: "include",
    })

    if (!response.ok) {
      window.location.href = "/"
      return
    }

    currentUser = await response.json()

    if (currentUser.role === "admin") {
      window.location.href = "/panel-admin.html"
      return
    }

    document.getElementById("userName").textContent = currentUser.name
    loadUserData()
  } catch (error) {
    console.error("[v0] Auth error:", error)
    window.location.href = "/"
  }
}

// Setup event listeners
function setupEventListeners() {
  document.getElementById("backToMapBtn").addEventListener("click", () => {
    window.location.href = "/"
  })

  document.getElementById("logoutBtn").addEventListener("click", logout)
}

// Load user data
async function loadUserData() {
  showLoading()
  try {
    await Promise.all([loadUserProfile(), loadUserBookings()])
  } catch (error) {
    console.error("[v0] Error loading user data:", error)
    showToast("Error al cargar datos", "error")
  } finally {
    hideLoading()
  }
}

// Load user profile
function loadUserProfile() {
  const profileDiv = document.getElementById("userProfile")

  profileDiv.innerHTML = `
    <div class="profile-info">
      <div class="profile-item">
        <strong><i class="fas fa-user"></i> Nombre:</strong> ${currentUser.name}
      </div>
      <div class="profile-item">
        <strong><i class="fas fa-envelope"></i> Email:</strong> ${currentUser.email}
      </div>
      <div class="profile-item">
        <strong><i class="fas fa-phone"></i> Teléfono:</strong> ${currentUser.phone || "No especificado"}
      </div>
      <div class="profile-item">
        <strong><i class="fas fa-calendar"></i> Miembro desde:</strong> ${new Date(currentUser.created_at).toLocaleDateString()}
      </div>
    </div>
  `
}

// Load user bookings
async function loadUserBookings() {
  try {
    const response = await fetch(`${API_BASE}/bookings/my-bookings`, {
      credentials: "include",
    })

    if (!response.ok) {
      throw new Error("Error al cargar reservas")
    }

    const bookings = await response.json()

    const bookingsDiv = document.getElementById("userBookings")

    if (bookings.length === 0) {
      bookingsDiv.innerHTML =
        '<div class="no-bookings"><p>No tienes reservas activas. <a href="/" style="color: #2563eb;">Buscar negocios</a></p></div>'
      return
    }

    bookingsDiv.innerHTML = bookings
      .map(
        (booking) => `
      <div class="booking-card">
        <div class="booking-header">
          <h4>${booking.business_name}</h4>
          <span class="booking-status status-${booking.status.toLowerCase()}">${booking.status}</span>
        </div>
        <div class="booking-details">
          <div class="booking-detail">
            <i class="fas fa-calendar"></i>
            <span>${new Date(booking.date).toLocaleDateString()}</span>
          </div>
          <div class="booking-detail">
            <i class="fas fa-clock"></i>
            <span>${booking.time}</span>
          </div>
          <div class="booking-detail">
            <i class="fas fa-map-marker-alt"></i>
            <span>${booking.business_address}</span>
          </div>
          ${booking.service ? `<div class="booking-detail"><i class="fas fa-briefcase"></i><span>${booking.service}</span></div>` : ""}
          ${booking.notes ? `<div class="booking-detail"><i class="fas fa-comment"></i><span>${booking.notes}</span></div>` : ""}
        </div>
        <div class="booking-actions">
          ${
            booking.status === "Confirmada"
              ? `<button class="btn btn-danger btn-small" onclick="cancelBooking(${booking.id})">
              <i class="fas fa-times"></i> Cancelar
            </button>`
              : ""
          }
          <button class="btn btn-info btn-small" onclick="viewOnMap('${booking.business_name}')">
            <i class="fas fa-map"></i> Ver en mapa
          </button>
        </div>
      </div>
    `,
      )
      .join("")
  } catch (error) {
    console.error("[v0] Error loading bookings:", error)
    showToast("Error al cargar reservas", "error")
    document.getElementById("userBookings").innerHTML = '<div class="no-bookings"><p>Error al cargar reservas</p></div>'
  }
}

// Cancel booking
async function cancelBooking(bookingId) {
  if (!confirm("¿Estás seguro de cancelar esta reserva?")) return

  showLoading()

  try {
    const response = await fetch(`${API_BASE}/bookings/${bookingId}/cancel`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })

    const data = await response.json()

    if (response.ok) {
      showToast("Reserva cancelada exitosamente", "success")
      loadUserBookings()
    } else {
      showToast(data.message || "Error al cancelar reserva", "error")
    }
  } catch (error) {
    console.error("[v0] Error canceling booking:", error)
    showToast("Error de conexión. Verifica que el servidor esté corriendo.", "error")
  } finally {
    hideLoading()
  }
}

// View on map
function viewOnMap(businessName) {
  window.location.href = `/?search=${encodeURIComponent(businessName)}`
}

// Logout
async function logout() {
  try {
    await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      credentials: "include",
    })
    window.location.href = "/"
  } catch (error) {
    console.error("[v0] Logout error:", error)
    showToast("Error al cerrar sesión", "error")
  }
}

// Utility functions
function showLoading() {
  document.getElementById("loadingSpinner").style.display = "flex"
}

function hideLoading() {
  document.getElementById("loadingSpinner").style.display = "none"
}

function showToast(message, type = "success") {
  console.log(`[v0] Toast (${type}):`, message)

  const toast = document.createElement("div")
  toast.className = `toast ${type}`

  const icon =
    type === "success"
      ? "check-circle"
      : type === "error"
        ? "exclamation-circle"
        : type === "warning"
          ? "exclamation-triangle"
          : "info-circle"

  toast.innerHTML = `
    <i class="fas fa-${icon}"></i>
    <span>${message}</span>
  `

  document.getElementById("toastContainer").appendChild(toast)

  setTimeout(() => {
    toast.style.animation = "slideOut 0.3s ease-in-out forwards"
    setTimeout(() => toast.remove(), 300)
  }, 3000)
}

console.log("[v0] User.js loaded")
