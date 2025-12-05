console.log("[v0] Initializing BookingMap Chile application...")

// API Base URL
const API_BASE = "/api"

// Global variables
let map
let userLocation = null
let businesses = []
let markers = []
let currentCategory = "all"
let currentUser = null

// Import Leaflet
const L = window.L

// Check if Leaflet is loaded
if (typeof L === "undefined") {
  console.error("[v0] Leaflet library not loaded!")
  alert("Error: El mapa no se puede cargar. Por favor, recarga la página.")
}

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
  console.log("[v0] DOM loaded, starting initialization...")
  initializeMap()
  setupEventListeners()
  loadBusinesses()
  checkAuthStatus()
})

// Check authentication status
async function checkAuthStatus() {
  console.log("[v0] Checking authentication status...")
  try {
    const response = await fetch(`${API_BASE}/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })

    if (response.ok) {
      const user = await response.json()
      console.log("[v0] User authenticated:", user)
      currentUser = user

      if (user.role === "admin") {
        // Don't auto-redirect, just show admin option
        updateUIForLoggedInUser(user)
      } else {
        updateUIForLoggedInUser(user)
      }
    } else {
      console.log("[v0] No authenticated user")
      currentUser = null
    }
  } catch (error) {
    console.log("[v0] Auth check error:", error)
    currentUser = null
  }
}

// Initialize map
function initializeMap() {
  console.log("[v0] Initializing map...")

  if (typeof L === "undefined") {
    console.error("[v0] Leaflet not available!")
    showToast("Error al cargar el mapa. Por favor, recarga la página.", "error")
    return
  }

  const defaultLat = -33.4489
  const defaultLng = -70.6693

  try {
    map = L.map("map").setView([defaultLat, defaultLng], 13)
    console.log("[v0] Map object created")

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map)

    console.log("[v0] Map tiles added successfully")

    // Request user's location
    if (navigator.geolocation) {
      console.log("[v0] Requesting user location...")
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("[v0] Location obtained:", position.coords)
          userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          map.setView([userLocation.lat, userLocation.lng], 15)
          addUserLocationMarker()
          updateBusinessDistances()
          showToast("Ubicación obtenida correctamente", "success")
        },
        (error) => {
          console.error("[v0] Geolocation error:", error)
          showToast("No se pudo obtener tu ubicación. Mostrando ubicación por defecto.", "warning")
        },
      )
    } else {
      console.log("[v0] Geolocation not supported")
      showToast("Tu navegador no soporta geolocalización", "warning")
    }
  } catch (error) {
    console.error("[v0] Error initializing map:", error)
    showToast("Error al inicializar el mapa", "error")
  }
}

// Add user location marker
function addUserLocationMarker() {
  if (userLocation && map) {
    console.log("[v0] Adding user location marker")
    const userIcon = L.divIcon({
      className: "user-location-marker",
      html: '<div style="background: #2563eb; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 10px rgba(0,0,0,0.3);"></div>',
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    })

    L.marker([userLocation.lat, userLocation.lng], { icon: userIcon }).addTo(map).bindPopup("Tu ubicación").openPopup()
  }
}

// Setup event listeners
function setupEventListeners() {
  console.log("[v0] Setting up event listeners...")

  // Search input
  const searchInput = document.getElementById("searchInput")
  if (searchInput) {
    searchInput.addEventListener("input", debounce(handleSearch, 300))
  }

  // Location button
  const locationBtn = document.getElementById("locationBtn")
  if (locationBtn) {
    locationBtn.addEventListener("click", requestLocation)
  }

  // Center map button
  const centerMapBtn = document.getElementById("centerMapBtn")
  if (centerMapBtn) {
    centerMapBtn.addEventListener("click", centerMap)
  }

  // Category buttons
  document.querySelectorAll(".category-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      console.log("[v0] Category selected:", this.dataset.category)
      document.querySelectorAll(".category-btn").forEach((b) => b.classList.remove("active"))
      this.classList.add("active")
      currentCategory = this.dataset.category
      filterBusinesses()
    })
  })

  // Auth buttons
  const loginBtn = document.getElementById("loginBtn")
  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      console.log("[v0] Opening login modal")
      document.getElementById("loginModal").style.display = "block"
    })
  }

  const registerBtn = document.getElementById("registerBtn")
  if (registerBtn) {
    registerBtn.addEventListener("click", () => {
      console.log("[v0] Opening register modal")
      document.getElementById("registerModal").style.display = "block"
    })
  }

  const adminBtn = document.getElementById("adminBtn")
  if (adminBtn) {
    adminBtn.addEventListener("click", () => {
      console.log("[v0] Redirecting to admin panel")
      window.location.href = "/panel-admin.html"
    })
  }

  // Modal close buttons
  document.querySelectorAll(".close").forEach((btn) => {
    btn.addEventListener("click", function () {
      this.closest(".modal").style.display = "none"
    })
  })

  // Close modals on outside click
  window.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal")) {
      e.target.style.display = "none"
    }
  })

  // Forms
  const loginForm = document.getElementById("loginForm")
  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin)
  }

  const registerForm = document.getElementById("registerForm")
  if (registerForm) {
    registerForm.addEventListener("submit", handleRegister)
  }

  console.log("[v0] Event listeners setup complete")
}

// Handle login
async function handleLogin(e) {
  e.preventDefault()
  console.log("[v0] Handling login...")

  const email = document.getElementById("loginEmail").value.trim()
  const password = document.getElementById("loginPassword").value

  if (!email || !password) {
    showToast("Por favor completa todos los campos", "error")
    return
  }

  showLoading()

  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (response.ok) {
      console.log("[v0] Login successful", data)
      showToast("Inicio de sesión exitoso", "success")

      currentUser = data.user

      setTimeout(() => {
        if (data.user.role === "admin") {
          window.location.href = "/panel-admin.html"
        } else {
          window.location.href = "/panel-usuario.html"
        }
      }, 500)
    } else {
      console.log("[v0] Login failed:", data.message)
      showToast(data.message || "Error al iniciar sesión", "error")
    }
  } catch (error) {
    console.error("[v0] Login error:", error)
    showToast("Error de conexión. Verifica que el servidor esté corriendo.", "error")
  } finally {
    hideLoading()
  }
}

// Handle register
async function handleRegister(e) {
  e.preventDefault()
  console.log("[v0] Handling registration...")

  const name = document.getElementById("registerName").value.trim()
  const email = document.getElementById("registerEmail").value.trim()
  const phone = document.getElementById("registerPhone").value.trim()
  const password = document.getElementById("registerPassword").value

  if (!name || !email || !phone || !password) {
    showToast("Por favor completa todos los campos", "error")
    return
  }

  if (password.length < 6) {
    showToast("La contraseña debe tener al menos 6 caracteres", "error")
    return
  }

  showLoading()

  try {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ name, email, phone, password }),
    })

    const data = await response.json()

    if (response.ok) {
      console.log("[v0] Registration successful")
      showToast("Cuenta creada correctamente. Por favor inicia sesión.", "success")
      document.getElementById("registerModal").style.display = "none"
      document.getElementById("registerForm").reset()
      setTimeout(() => {
        document.getElementById("loginModal").style.display = "block"
      }, 1000)
    } else {
      console.log("[v0] Registration failed:", data.message)
      showToast(data.message || "Error al crear cuenta", "error")
    }
  } catch (error) {
    console.error("[v0] Registration error:", error)
    showToast("Error de conexión", "error")
  } finally {
    hideLoading()
  }
}

// Load businesses
async function loadBusinesses() {
  console.log("[v0] Loading businesses...")
  showLoading()

  try {
    const response = await fetch(`${API_BASE}/businesses`)
    const data = await response.json()

    if (response.ok) {
      businesses = data
      console.log(`[v0] Loaded ${businesses.length} businesses`)
      displayBusinesses()
      addBusinessMarkers()
      updateBusinessDistances()
    } else {
      console.error("[v0] Failed to load businesses")
      showToast("Error al cargar negocios", "error")
    }
  } catch (error) {
    console.error("[v0] Error loading businesses:", error)
    showToast("Error de conexión", "error")
  } finally {
    hideLoading()
  }
}

// Display businesses
function displayBusinesses() {
  console.log("[v0] Displaying businesses...")

  let filteredBusinesses = businesses
  if (currentCategory !== "all") {
    filteredBusinesses = businesses.filter((b) => b.category === currentCategory)
  }

  displayResultsList(filteredBusinesses)
  addBusinessMarkers()
}

// Display results list
function displayResultsList(businessesToShow) {
  const resultsList = document.getElementById("resultsList")
  const resultsCount = document.getElementById("resultsCount")

  resultsCount.textContent = `${businessesToShow.length} lugares encontrados`

  if (businessesToShow.length === 0) {
    resultsList.innerHTML = '<div class="no-results"><p>No se encontraron negocios</p></div>'
    return
  }

  resultsList.innerHTML = businessesToShow
    .map(
      (business) => `
    <div class="result-card" onclick="focusOnBusiness(${business.id})">
      <div class="result-header">
        <h4 class="result-title">${business.name}</h4>
        <span class="result-category">${getCategoryName(business.category)}</span>
      </div>
      <div class="result-info">
        <span><i class="fas fa-map-marker-alt"></i> ${business.address}</span>
        <span><i class="fas fa-phone"></i> ${business.phone}</span>
        ${business.distance ? `<span><i class="fas fa-route"></i> ${business.distance}</span>` : ""}
        <span><i class="fas fa-star"></i> ${business.avg_rating || "Sin calificación"}</span>
        ${
          business.services && Array.isArray(business.services)
            ? `<span><i class="fas fa-briefcase"></i> Servicios: ${business.services.join(", ")}</span>`
            : ""
        }
      </div>
      <div class="result-actions">
        ${
          business.business_type === "pyme"
            ? `
          <button class="btn btn-success btn-small" onclick="event.stopPropagation(); openBookingModal(${business.id})">
            <i class="fas fa-calendar-plus"></i> Reservar
          </button>
          <button class="btn btn-info btn-small" onclick="event.stopPropagation(); openInGoogleMaps(${business.lat}, ${business.lng})">
            <i class="fas fa-map"></i> Ver ubicación
          </button>
        `
            : `
          <button class="btn btn-info btn-small" onclick="event.stopPropagation(); openInGoogleMaps(${business.lat}, ${business.lng})">
            <i class="fas fa-map"></i> Ver ubicación
          </button>
        `
        }
        <button class="btn btn-info btn-small" onclick="event.stopPropagation(); viewReviews(${business.id})">
          <i class="fas fa-comments"></i> Reseñas
        </button>
      </div>
    </div>
  `,
    )
    .join("")
}

// Add business markers
function addBusinessMarkers() {
  if (!map) {
    console.log("[v0] Map not initialized, skipping markers")
    return
  }

  console.log("[v0] Adding business markers...")

  // Clear existing markers
  markers.forEach((marker) => map.removeLayer(marker))
  markers = []

  let filteredBusinesses = businesses
  if (currentCategory !== "all") {
    filteredBusinesses = businesses.filter((b) => b.category === currentCategory)
  }

  filteredBusinesses.forEach((business) => {
    const markerColor = getCategoryColor(business.category)
    const icon = L.divIcon({
      className: "custom-marker",
      html: `<div style="background-color: ${markerColor}; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;"><i class="${getCategoryIcon(business.category)}" style="color: white; font-size: 14px;"></i></div>`,
    })

    const marker = L.marker([business.lat, business.lng], { icon }).addTo(map)

    const servicesHtml =
      business.services && Array.isArray(business.services)
        ? `<p><strong>Servicios:</strong> ${business.services.join(", ")}</p>`
        : ""

    marker.bindPopup(`
      <div style="min-width: 200px;">
        <h3 style="margin-bottom: 8px;">${business.name}</h3>
        <p style="color: #666; margin-bottom: 8px;">${business.address}</p>
        <p style="margin-bottom: 8px;"><i class="fas fa-phone"></i> ${business.phone}</p>
        <p style="margin-bottom: 8px;"><i class="fas fa-star"></i> ${business.avg_rating || "Sin calificación"}</p>
        ${servicesHtml}
        ${
          business.business_type === "pyme"
            ? `<button onclick="openBookingModal(${business.id})" class="btn btn-success btn-small" style="margin-top: 0.5rem; width: 100%;">Reservar</button>`
            : `<button onclick="openInGoogleMaps(${business.lat}, ${business.lng})" class="btn btn-info btn-small" style="margin-top: 0.5rem; width: 100%;">Ver ubicación</button>`
        }
        <button onclick="viewReviews(${business.id})" class="btn btn-info btn-small" style="margin-top: 0.5rem; width: 100%;">Ver Reseñas</button>
      </div>
    `)

    markers.push(marker)
  })
}

// Get category name
function getCategoryName(category) {
  const categories = {
    beauty: "Belleza",
    health: "Salud",
    automotive: "Automotriz",
    shopping: "Compras",
    food: "Comida",
    all: "Todos",
  }
  return categories[category] || category
}

// Focus on business
function focusOnBusiness(businessId) {
  const business = businesses.find((b) => b.id === businessId)
  if (business && map) {
    console.log("[v0] Focusing on business:", business.name)
    map.setView([business.lat, business.lng], 17)
    const marker = markers.find((m) => {
      const latlng = m.getLatLng()
      return latlng.lat === business.lat && latlng.lng === business.lng
    })
    if (marker) {
      marker.openPopup()
    }
  }
}

async function openBookingModal(businessId) {
  console.log("[v0] Opening booking modal for business:", businessId)

  // Check if user is logged in
  if (!currentUser) {
    showToast("Debes iniciar sesión para hacer una reserva", "warning")
    document.getElementById("loginModal").style.display = "block"
    return
  }

  const business = businesses.find((b) => b.id === businessId)
  if (!business) {
    showToast("Negocio no encontrado", "error")
    return
  }

  const modal = document.getElementById("bookingModal")
  const content = document.getElementById("bookingContent")

  showLoading()

  try {
    const today = new Date().toISOString().split("T")[0]
    const response = await fetch(`${API_BASE}/businesses/${businessId}/available-times?date=${today}`)
    const availableTimes = await response.json()

    if (!response.ok) {
      throw new Error("Error al cargar horarios")
    }

    content.innerHTML = `
      <div class="booking-form">
        <h3>${business.name}</h3>
        <p style="color: #6b7280; margin-bottom: 1.5rem;">${business.address}</p>
        
        <form id="createBookingForm">
          <div class="form-group">
            <label for="bookingDate">Fecha</label>
            <input type="date" id="bookingDate" required min="${today}">
          </div>
          
          <div class="form-group">
            <label for="bookingTime">Hora</label>
            <select id="bookingTime" required>
              <option value="">Selecciona una hora</option>
              ${
                availableTimes && availableTimes.length > 0
                  ? availableTimes.map((time) => `<option value="${time}">${time}</option>`).join("")
                  : '<option value="">No hay horarios disponibles</option>'
              }
            </select>
          </div>
          
          <div class="form-group">
            <label for="bookingNotes">Notas adicionales (opcional)</label>
            <textarea id="bookingNotes" rows="3" placeholder="Información adicional sobre tu reserva"></textarea>
          </div>
          
          <button type="submit" class="btn btn-primary btn-full">Confirmar Reserva</button>
        </form>
      </div>
    `

    document.getElementById("bookingDate").addEventListener("change", async (e) => {
      const date = e.target.value
      showLoading()
      try {
        const response = await fetch(`${API_BASE}/businesses/${businessId}/available-times?date=${date}`)
        const availableTimes = await response.json()

        const timeSelect = document.getElementById("bookingTime")
        timeSelect.innerHTML = '<option value="">Selecciona una hora</option>'

        if (availableTimes && availableTimes.length > 0) {
          availableTimes.forEach((time) => {
            const option = document.createElement("option")
            option.value = time
            option.textContent = time
            timeSelect.appendChild(option)
          })
        } else {
          timeSelect.innerHTML = '<option value="">No hay horarios disponibles</option>'
        }
      } catch (error) {
        console.error("[v0] Error loading times:", error)
        showToast("Error al cargar horarios", "error")
      } finally {
        hideLoading()
      }
    })

    // Handle form submission
    document.getElementById("createBookingForm").addEventListener("submit", async (e) => {
      e.preventDefault()

      const date = document.getElementById("bookingDate").value
      const time = document.getElementById("bookingTime").value
      const notes = document.getElementById("bookingNotes").value

      if (!date || !time) {
        showToast("Por favor completa todos los campos requeridos", "error")
        return
      }

      showLoading()

      try {
        const response = await fetch(`${API_BASE}/bookings`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            business_id: businessId,
            date,
            time,
            notes: notes || null,
          }),
        })

        const data = await response.json()

        if (response.ok) {
          showToast("Reserva creada exitosamente", "success")
          modal.style.display = "none"
        } else {
          showToast(data.message || "Error al crear reserva", "error")
        }
      } catch (error) {
        console.error("[v0] Booking error:", error)
        showToast("Error de conexión", "error")
      } finally {
        hideLoading()
      }
    })

    modal.style.display = "block"
  } catch (error) {
    console.error("[v0] Error opening booking modal:", error)
    showToast("Error al cargar el formulario de reserva", "error")
  } finally {
    hideLoading()
  }
}

async function viewReviews(businessId) {
  console.log("[v0] Viewing reviews for business:", businessId)

  const business = businesses.find((b) => b.id === businessId)
  if (!business) {
    showToast("Negocio no encontrado", "error")
    return
  }

  const modal = document.getElementById("reviewsModal")
  const content = document.getElementById("reviewsContent")

  showLoading()

  try {
    const response = await fetch(`${API_BASE}/reviews/business/${businessId}`)
    const reviews = await response.json()

    if (!response.ok && response.status !== 404) {
      throw new Error("Error al cargar reseñas")
    }

    content.innerHTML = `
      <div class="reviews-container">
        <h3>${business.name}</h3>
        <p style="color: #6b7280; margin-bottom: 1.5rem;">Calificación promedio: ${business.avg_rating || business.rating || "Sin calificación"} ⭐ (${business.review_count || 0} reseñas)</p>
        
        ${
          currentUser
            ? `
          <button onclick="openLeaveReviewModal(${businessId})" class="btn btn-primary" style="margin-bottom: 1.5rem;">
            <i class="fas fa-star"></i> Dejar una reseña
          </button>
        `
            : `
          <p style="color: #6b7280; margin-bottom: 1.5rem;">
            <i class="fas fa-info-circle"></i> Inicia sesión para dejar una reseña
          </p>
        `
        }
        
        <div class="reviews-list">
          ${
            reviews && reviews.length > 0
              ? reviews
                  .map(
                    (review) => `
            <div class="review-card">
              <div class="review-header">
                <strong>${review.user_name || "Usuario"}</strong>
                <span class="review-rating">${"⭐".repeat(review.rating)}</span>
              </div>
              <p class="review-comment">${review.comment || "Sin comentario"}</p>
              <span class="review-date">${new Date(review.created_at).toLocaleDateString()}</span>
            </div>
          `,
                  )
                  .join("")
              : '<p style="color: #6b7280;">No hay reseñas aún. ¡Sé el primero en dejar una!</p>'
          }
        </div>
      </div>
    `

    modal.style.display = "block"
  } catch (error) {
    console.error("[v0] Error loading reviews:", error)
    showToast("Error al cargar reseñas", "error")
  } finally {
    hideLoading()
  }
}

window.openLeaveReviewModal = (businessId) => {
  const business = businesses.find((b) => b.id === businessId)
  if (!business) return

  const modal = document.getElementById("leaveReviewModal")
  const content = document.getElementById("leaveReviewContent")

  content.innerHTML = `
    <div class="review-form">
      <h3>Deja tu opinión sobre ${business.name}</h3>
      
      <form id="submitReviewForm">
        <div class="form-group">
          <label>Calificación</label>
          <div class="star-rating" id="starRating">
            <span class="star" data-rating="1">⭐</span>
            <span class="star" data-rating="2">⭐</span>
            <span class="star" data-rating="3">⭐</span>
            <span class="star" data-rating="4">⭐</span>
            <span class="star" data-rating="5">⭐</span>
          </div>
          <input type="hidden" id="reviewRating" required>
        </div>
        
        <div class="form-group">
          <label for="reviewComment">Comentario</label>
          <textarea id="reviewComment" rows="4" required placeholder="Cuéntanos sobre tu experiencia..."></textarea>
        </div>
        
        <button type="submit" class="btn btn-primary btn-full">Publicar Reseña</button>
      </form>
    </div>
  `

  // Star rating interaction
  const stars = content.querySelectorAll(".star")
  stars.forEach((star) => {
    star.addEventListener("click", function () {
      const rating = this.dataset.rating
      document.getElementById("reviewRating").value = rating

      stars.forEach((s, index) => {
        if (index < rating) {
          s.style.opacity = "1"
          s.style.transform = "scale(1.2)"
        } else {
          s.style.opacity = "0.3"
          s.style.transform = "scale(1)"
        }
      })
    })
  })

  // Handle form submission
  document.getElementById("submitReviewForm").addEventListener("submit", async (e) => {
    e.preventDefault()

    const rating = document.getElementById("reviewRating").value
    const comment = document.getElementById("reviewComment").value

    if (!rating) {
      showToast("Por favor selecciona una calificación", "error")
      return
    }

    showLoading()

    try {
      const response = await fetch(`${API_BASE}/reviews/business/${businessId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          rating: Number.parseInt(rating),
          comment,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        showToast("Reseña publicada exitosamente", "success")
        modal.style.display = "none"
        document.getElementById("reviewsModal").style.display = "none"
        // Reload businesses to update ratings
        loadBusinesses()
      } else {
        showToast(data.message || "Error al publicar reseña", "error")
      }
    } catch (error) {
      console.error("[v0] Review error:", error)
      showToast("Error de conexión", "error")
    } finally {
      hideLoading()
    }
  })

  modal.style.display = "block"
}

// Center map
function centerMap() {
  if (userLocation && map) {
    console.log("[v0] Centering map on user location")
    map.setView([userLocation.lat, userLocation.lng], 15)
  } else {
    showToast("Ubicación no disponible", "warning")
  }
}

// Update business distances
function updateBusinessDistances() {
  if (!userLocation) return

  console.log("[v0] Updating business distances")

  businesses.forEach((business) => {
    const distance = calculateDistance(userLocation.lat, userLocation.lng, business.lat, business.lng)
    business.distance = `${distance.toFixed(2)} km`
  })

  businesses.sort((a, b) => {
    const distA = Number.parseFloat(a.distance)
    const distB = Number.parseFloat(b.distance)
    return distA - distB
  })

  displayBusinesses()
}

// Calculate distance
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Update UI for logged in user
function updateUIForLoggedInUser(user) {
  console.log("[v0] Updating UI for logged in user")

  const loginBtn = document.getElementById("loginBtn")
  const registerBtn = document.getElementById("registerBtn")
  const nav = document.querySelector(".nav")

  if (loginBtn) loginBtn.style.display = "none"
  if (registerBtn) registerBtn.style.display = "none"

  const userBtn = document.createElement("button")
  userBtn.className = "btn btn-outline"
  userBtn.innerHTML = `<i class="fas fa-user"></i> ${user.name}`
  userBtn.onclick = () => {
    if (user.role === "admin") {
      window.location.href = "/panel-admin.html"
    } else {
      window.location.href = "/panel-usuario.html"
    }
  }

  const logoutBtn = document.createElement("button")
  logoutBtn.className = "btn btn-danger"
  logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Cerrar Sesión'
  logoutBtn.onclick = handleLogout

  nav.appendChild(userBtn)
  nav.appendChild(logoutBtn)
}

// Handle logout
async function handleLogout() {
  console.log("[v0] Logging out...")
  try {
    await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      credentials: "include",
    })
    window.location.reload()
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

function debounce(func, wait) {
  let timeout
  return function (...args) {
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(this, args), wait)
  }
}

// Declare handleSearch, requestLocation, and filterBusinesses functions
function handleSearch() {
  // Implement search functionality here
}

function requestLocation() {
  // Implement request location functionality here
}

function filterBusinesses() {
  // Implement filter businesses functionality here
}

window.openInGoogleMaps = (lat, lng) => {
  const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
  window.open(url, "_blank")
}

function getCategoryColor(category) {
  const categoryColors = {
    beauty: "#ec4899",
    health: "#10b981",
    automotive: "#f59e0b",
    shopping: "#8b5cf6",
    food: "#ef4444",
  }
  return categoryColors[category] || "#2563eb"
}

function getCategoryIcon(category) {
  const categoryIcons = {
    beauty: "fas fa-store",
    health: "fas fa-clinic-medical",
    automotive: "fas fa-car",
    shopping: "fas fa-shopping-cart",
    food: "fas fa-utensils",
  }
  return categoryIcons[category] || "fas fa-store"
}

console.log("[v0] App.js loaded successfully")
