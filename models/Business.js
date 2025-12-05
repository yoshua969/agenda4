class Business {
  constructor(db) {
    this.db = db
  }

  async getAll() {
    return new Promise((resolve, reject) => {
      this.db.all("SELECT * FROM businesses ORDER BY created_at DESC", [], (err, rows) => {
        if (err) reject(err)
        else resolve(rows)
      })
    })
  }

  async findById(id) {
    return new Promise((resolve, reject) => {
      this.db.get("SELECT * FROM businesses WHERE id = ?", [id], (err, row) => {
        if (err) reject(err)
        else resolve(row)
      })
    })
  }

  async create(businessData) {
    const { name, category, type, business_type, lat, lng, address, phone, hours, services } = businessData
    return new Promise((resolve, reject) => {
      this.db.run(
        "INSERT INTO businesses (name, category, type, business_type, lat, lng, address, phone, hours, services) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [name, category, type, business_type, lat, lng, address, phone, hours, services],
        function (err) {
          if (err) reject(err)
          else resolve({ id: this.lastID })
        },
      )
    })
  }

  async delete(id) {
    return new Promise((resolve, reject) => {
      this.db.run("DELETE FROM businesses WHERE id = ?", [id], function (err) {
        if (err) reject(err)
        else resolve({ changes: this.changes })
      })
    })
  }

  async getSchedules(businessId) {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM business_schedules WHERE business_id = ? ORDER BY CASE day_of_week WHEN "Monday" THEN 1 WHEN "Tuesday" THEN 2 WHEN "Wednesday" THEN 3 WHEN "Thursday" THEN 4 WHEN "Friday" THEN 5 WHEN "Saturday" THEN 6 WHEN "Sunday" THEN 7 END',
        [businessId],
        (err, rows) => {
          if (err) reject(err)
          else resolve(rows)
        },
      )
    })
  }

  async createSchedule(businessId, schedule) {
    const { day_of_week, is_open, open_time, close_time, booking_interval } = schedule
    return new Promise((resolve, reject) => {
      this.db.run(
        "INSERT INTO business_schedules (business_id, day_of_week, is_open, open_time, close_time, booking_interval) VALUES (?, ?, ?, ?, ?, ?)",
        [businessId, day_of_week, is_open ? 1 : 0, open_time, close_time, booking_interval || 30],
        function (err) {
          if (err) reject(err)
          else resolve({ id: this.lastID })
        },
      )
    })
  }
}

module.exports = Business
