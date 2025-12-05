class Booking {
  constructor(db) {
    this.db = db
  }

  async create(bookingData) {
    const { user_id, business_id, business_name, business_address, user_name, user_email, date, time, service, notes } =
      bookingData
    return new Promise((resolve, reject) => {
      this.db.run(
        "INSERT INTO bookings (user_id, business_id, business_name, business_address, user_name, user_email, date, time, service, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [user_id, business_id, business_name, business_address, user_name, user_email, date, time, service, notes],
        function (err) {
          if (err) reject(err)
          else resolve({ id: this.lastID })
        },
      )
    })
  }

  async getAll() {
    return new Promise((resolve, reject) => {
      this.db.all("SELECT * FROM bookings ORDER BY created_at DESC", [], (err, rows) => {
        if (err) reject(err)
        else resolve(rows)
      })
    })
  }

  async getByUserId(userId) {
    return new Promise((resolve, reject) => {
      this.db.all("SELECT * FROM bookings WHERE user_id = ? ORDER BY date DESC, time DESC", [userId], (err, rows) => {
        if (err) reject(err)
        else resolve(rows)
      })
    })
  }

  async getByBusinessId(businessId, date) {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM bookings WHERE business_id = ? AND date = ? AND status = "Confirmada"',
        [businessId, date],
        (err, rows) => {
          if (err) reject(err)
          else resolve(rows)
        },
      )
    })
  }

  async updateStatus(id, status) {
    return new Promise((resolve, reject) => {
      this.db.run("UPDATE bookings SET status = ? WHERE id = ?", [status, id], function (err) {
        if (err) reject(err)
        else resolve({ changes: this.changes })
      })
    })
  }
}

module.exports = Booking
