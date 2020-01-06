class DatabaseManager {
  constructor(db) {
    this.db = db
  }

  async start() {
    await this.db.authenticate()
    await this.db.sync()
  }

  async drop() {
    await this.db.drop()
  }

  async stop() {
    await this.db.close()
  }
}

module.exports = DatabaseManager
