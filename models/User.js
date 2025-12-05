const bcrypt = require("bcryptjs")

class User {
  constructor(db) {
    this.db = db
  }

  async create(name, email, phone, password) {
    const hashedPassword = await bcrypt.hash(password, 10)
    return new Promise((resolve, reject) => {
      this.db.run(
        "INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)",
        [name, email, phone, hashedPassword],
        function (err) {
          if (err) reject(err)
          else resolve({ id: this.lastID })
        },
      )
    })
  }

  async findByEmail(email) {
    return new Promise((resolve, reject) => {
      this.db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => {
        if (err) reject(err)
        else resolve(row)
      })
    })
  }

  async findById(id) {
    return new Promise((resolve, reject) => {
      this.db.get("SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?", [id], (err, row) => {
        if (err) reject(err)
        else resolve(row)
      })
    })
  }

  async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword)
  }
}

module.exports = User
