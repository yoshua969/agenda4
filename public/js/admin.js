console.log("[v0] Initializing admin panel...")

const API_BASE = "/api"
let currentUser = null
let addBusinessMapInstance = null
let selectedLocation = null

const daysOfWeek = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
const daysOfWeekEnglish = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

// Declare L variable
const L = window.L

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
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })

    if (!response.ok) {
      console.log("[v0] Not authenticated, redirecting...")
      window.location.href = "/"
      return
    }

    currentUser = await response.json()

    if (currentUser.role !== "admin") {
      console.log("[v0] Not admin, redirecting to user panel...")
      window.location.href = "/panel-usuario.html"
      return
    }

    console.log("[v0] Admin authenticated:", currentUser.name)
    document.getElementById("adminName").textContent = currentUser.name
    loadDashboardData()
  } catch (error) {
    console.error("[v0] Auth error:", error)
    showToast("Error de autenticación", "error")
    setTimeout(() => {
      window.location.href = "/"
    }, 2000)
  }
}

// Setup event listeners
function setupEventListeners() {
  document.getElementById("backToMapBtn").addEventListener("click", () => {
    window.location.href = "/"
  })

  document.getElementById("logoutBtn").addEventListener("click", logout)
  document.getElementById("addBusinessBtn").addEventListener("click", openAddBusinessModal)
  document.getElementById("manageBusinessBtn").addEventListener("click", openManageBusinessModal)

  // Modal closes
  document.querySelectorAll(".close").forEach((btn) => {
    btn.addEventListener("click", function () {
      this.closest(".modal").style.display = "none"
    })
  })

  window.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal")) {
      e.target.style.display = "none"
    }
  })

  // Business type change
  const businessType = document.getElementById("businessType")
  if (businessType) {
    businessType.addEventListener("change", handleBusinessTypeChange)
  }

  // Form submit
  const addBusinessForm = document.getElementById("addBusinessForm")
  if (addBusinessForm) {
    addBusinessForm.addEventListener("submit", handleAddBusiness)
  }
}

// Load dashboard data
async function loadDashboardData() {
  showLoading()
  try {
    // Load stats
    const statsResponse = await fetch(`${API_BASE}/businesses`)
    const businesses = await statsResponse.json()

    const statsHtml = `
      <div class="stat-card">
        <h4>${businesses.length}</h4>
        <p>Total de Negocios</p>
      </div>
      <div class="stat-card">
        <h4>${businesses.filter((b) => b.business_type === "pyme").length}</h4>
        <p>PYMEs con Reservas</p>
      </div>
      <div class="stat-card">
        <h4>${businesses.filter((b) => b.business_type === "empresa").length}</h4>
        <p>Empresas</p>
      </div>
    `
    document.getElementById("adminStats").innerHTML = statsHtml

    // Load recent bookings
    const bookingsResponse = await fetch(`${API_BASE}/bookings`, {
      credentials: "include",
    })
    const bookings = await bookingsResponse.json()

    const bookingsHtml =
      bookings.length > 0
        ? bookings
            .slice(0, 5)
            .map(
              (booking) => `
        <div style="padding: 1rem; border-bottom: 1px solid #e5e7eb;">
          <strong>${booking.user_name}</strong> - ${booking.business_name}<br>
          <small style="color: #6b7280;">${new Date(booking.date).toLocaleDateString()} ${booking.time}</small>
        </div>
      `,
            )
            .join("")
        : '<p style="padding: 1rem; color: #6b7280;">No hay reservas recientes</p>'

    document.getElementById("recentBookings").innerHTML = bookingsHtml
  } catch (error) {
    console.error("[v0] Error loading dashboard:", error)
    showToast("Error al cargar datos", "error")
  } finally {
    hideLoading()
  }
}

// Open add business modal
function openAddBusinessModal() {
  console.log("[v0] Opening add business modal")
  document.getElementById("addBusinessModal").style.display = "block"

  // Initialize map
  setTimeout(() => {
    if (!addBusinessMapInstance) {
      addBusinessMapInstance = L.map("addBusinessMap").setView([-33.4489, -70.6693], 13)

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(addBusinessMapInstance)

      // Click to select location
      addBusinessMapInstance.on("click", (e) => {
        selectedLocation = e.latlng
        document.getElementById("businessLat").value = e.latlng.lat
        document.getElementById("businessLng").value = e.latlng.lng

        // Remove previous marker
        addBusinessMapInstance.eachLayer((layer) => {
          if (layer instanceof L.Marker) {
            addBusinessMapInstance.removeLayer(layer)
          }
        })

        // Add new marker
        L.marker([e.latlng.lat, e.latlng.lng]).addTo(addBusinessMapInstance)
        showToast("Ubicación seleccionada", "success")
      })
    }
  }, 300)
}

// Handle business type change
function handleBusinessTypeChange(e) {
  const type = e.target.value
  const pymeSection = document.getElementById("pymeScheduleSection")
  const empresaSection = document.getElementById("empresaSection")

  if (type === "pyme") {
    pymeSection.style.display = "block"
    empresaSection.style.display = "none"
    generateScheduleInputs()
  } else if (type === "empresa") {
    pymeSection.style.display = "none"
    empresaSection.style.display = "block"
  } else {
    pymeSection.style.display = "none"
    empresaSection.style.display = "none"
  }
}

// Generate schedule inputs
function generateScheduleInputs() {
  const container = document.getElementById("scheduleContainer")
  container.innerHTML = daysOfWeek
    .map(
      (day, index) => `
    <div class="schedule-day">
      <div class="day-header">
        <label>
          <input type="checkbox" class="day-checkbox" data-day="${day}" ${index < 5 ? "checked" : ""}>
          <strong>${day}</strong>
        </label>
      </div>
      <div class="day-times">
        <input type="time" class="time-input" data-day="${day}" data-type="open" value="09:00">
        <span>a</span>
        <input type="time" class="time-input" data-day="${day}" data-type="close" value="18:00">
      </div>
    </div>
  `,
    )
    .join("")
}

// Handle add business
async function handleAddBusiness(e) {
  e.preventDefault()
  console.log("[v0] Adding business...")

  const businessType = document.getElementById("businessType").value
  const name = document.getElementById("businessName").value.trim()
  const category = document.getElementById("businessCategory").value
  const phone = document.getElementById("businessPhone").value.trim()
  const address = document.getElementById("businessAddress").value.trim()
  const lat = document.getElementById("businessLat").value
  const lng = document.getElementById("businessLng").value

  // Validation
  if (!businessType) {
    showToast("Por favor selecciona el tipo de negocio", "warning")
    return
  }

  if (!name || !category || !phone || !address) {
    showToast("Por favor completa todos los campos requeridos", "warning")
    return
  }

  if (!lat || !lng) {
    showToast("Por favor selecciona una ubicación en el mapa", "warning")
    return
  }

  const businessData = {
    name,
    category,
    type: category,
    phone,
    address,
    lat: Number.parseFloat(lat),
    lng: Number.parseFloat(lng),
    business_type: businessType,
  }

  // Add schedule data for PYMEs
  if (businessType === "pyme") {
    const schedules = []
    let hasAtLeastOneOpenDay = false

    daysOfWeek.forEach((day, index) => {
      const englishDay = daysOfWeekEnglish[index]
      const checkbox = document.querySelector(`.day-checkbox[data-day="${day}"]`)
      if (checkbox && checkbox.checked) {
        hasAtLeastOneOpenDay = true
        const openTime = document.querySelector(`.time-input[data-day="${day}"][data-type="open"]`).value
        const closeTime = document.querySelector(`.time-input[data-day="${day}"][data-type="close"]`).value
        schedules.push({
          day_of_week: englishDay,
          open_time: openTime,
          close_time: closeTime,
          is_open: true,
        })
      } else {
        schedules.push({
          day_of_week: englishDay,
          is_open: false,
        })
      }
    })

    if (!hasAtLeastOneOpenDay) {
      showToast("Debes seleccionar al menos un día de atención", "warning")
      return
    }

    businessData.schedules = schedules
    businessData.booking_interval = Number.parseInt(document.getElementById("bookingInterval").value)

    const services = document.getElementById("businessServices").value.trim()
    if (services) {
      businessData.services = services
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s)
    }
  }

  showLoading()

  try {
    console.log("[v0] Sending business data:", businessData)

    const response = await fetch(`${API_BASE}/businesses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(businessData),
    })

    const data = await response.json()

    if (response.ok) {
      showToast("Negocio agregado exitosamente", "success")
      document.getElementById("addBusinessModal").style.display = "none"
      document.getElementById("addBusinessForm").reset()

      // Reset map
      if (addBusinessMapInstance) {
        addBusinessMapInstance.eachLayer((layer) => {
          if (layer instanceof L.Marker) {
            addBusinessMapInstance.removeLayer(layer)
          }
        })
        selectedLocation = null
        document.getElementById("businessLat").value = ""
        document.getElementById("businessLng").value = ""
      }

      loadDashboardData()
    } else {
      console.error("[v0] Server error:", data)
      showToast(data.message || "Error al agregar negocio", "error")
    }
  } catch (error) {
    console.error("[v0] Error adding business:", error)
    showToast("Error de conexión. Verifica que el servidor esté corriendo.", "error")
  } finally {
    hideLoading()
  }
}

// Open manage business modal
async function openManageBusinessModal() {
  console.log("[v0] Opening manage business modal")
  showLoading()

  try {
    const response = await fetch(`${API_BASE}/businesses`)
    const businesses = await response.json()

    const listHtml =
      businesses.length > 0
        ? businesses
            .map(
              (business) => `
        <div class="business-item">
          <h4>${business.name}</h4>
          <p><i class="fas fa-map-marker-alt"></i> ${business.address}</p>
          <p><i class="fas fa-tag"></i> ${getCategoryName(business.category)}</p>
          <p><i class="fas fa-phone"></i> ${business.phone}</p>
          <p><i class="fas fa-building"></i> ${business.business_type === "pyme" ? "PYME" : "Empresa"}</p>
          <div class="business-item-actions">
            <button onclick="deleteBusiness(${business.id})" class="btn btn-danger btn-small">
              <i class="fas fa-trash"></i> Eliminar
            </button>
          </div>
        </div>
      `,
            )
            .join("")
        : '<p style="padding: 1rem; color: #6b7280;">No hay negocios registrados</p>'

    document.getElementById("businessManagementList").innerHTML = listHtml
    document.getElementById("manageBusinessModal").style.display = "block"
  } catch (error) {
    console.error("[v0] Error loading businesses:", error)
    showToast("Error al cargar negocios", "error")
  } finally {
    hideLoading()
  }
}

// Delete business
async function deleteBusiness(businessId) {
  if (!confirm("¿Estás seguro de eliminar este negocio? Esta acción no se puede deshacer.")) return

  showLoading()

  try {
    const response = await fetch(`${API_BASE}/businesses/${businessId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })

    const data = await response.json()

    if (response.ok) {
      showToast("Negocio eliminado exitosamente", "success")
      openManageBusinessModal()
      loadDashboardData()
    } else {
      showToast(data.message || "Error al eliminar negocio", "error")
    }
  } catch (error) {
    console.error("[v0] Error deleting business:", error)
    showToast("Error de conexión. Verifica que el servidor esté corriendo.", "error")
  } finally {
    hideLoading()
  }
}

// Get category name
function getCategoryName(category) {
  const categories = {
    beauty: "Belleza",
    health: "Salud",
    automotive: "Automotriz",
    shopping: "Compras",
    food: "Comida",
  }
  return categories[category] || category
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

console.log("[v0] Admin.js loaded")
