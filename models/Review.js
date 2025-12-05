class Review {
  constructor(db) {
    this.db = db
  }

  async create(reviewData) {
    const { business_id, user_id, rating, comment } = reviewData
    return new Promise((resolve, reject) => {
      this.db.run(
        "INSERT INTO reviews (business_id, user_id, rating, comment) VALUES (?, ?, ?, ?)",
        [business_id, user_id, rating, comment],
        function (err) {
          if (err) reject(err)
          else resolve({ id: this.lastID })
        },
      )
    })
  }

  async getByBusinessId(businessId) {
    return new Promise((resolve, reject) => {
      this.db.all(
        "SELECT r.*, u.name as user_name FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.business_id = ? ORDER BY r.created_at DESC",
        [businessId],
        (err, rows) => {
          if (err) reject(err)
          else resolve(rows)
        },
      )
    })
  }

  async getAverageRating(businessId) {
    return new Promise((resolve, reject) => {
      this.db.get(
        "SELECT AVG(rating) as avg_rating, COUNT(*) as review_count FROM reviews WHERE business_id = ?",
        [businessId],
        (err, row) => {
          if (err) reject(err)
          else resolve(row)
        },
      )
    })
  }
}

module.exports = Review
