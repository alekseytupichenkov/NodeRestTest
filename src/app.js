const Sequelize = require('sequelize')
const PasswordHasher = require('./core/PasswordHasher')
const createUserModel = require('./models/User')
const createTaskModel = require('./models/Task')
const DatabaseManager = require('./core/DatabaseManager')
const serverModule = require('./server')
const logger = require('./core/logger')

module.exports = (config) => {
  const container = {}

  const start = async () => {
    container.config = config
    container.services = {}

    container.services.logger = logger(container.config.logger.path, process.env.NODE_ENV || 'dev')

    container.services.db = new Sequelize(
      config.db.databaseName,
      config.db.user,
      config.db.password,
      {
        logging: (message) => container.services.logger.debug(message),
        ...config.db.options,
      },
    )

    container.services.passwordHasher = new PasswordHasher()

    container.models = {}
    container.models.User = createUserModel(container.services.db, container.services.passwordHasher)
    container.models.Task = createTaskModel(container.services.db, container.models.User)

    container.services.databaseManager = new DatabaseManager(container.services.db)
    await container.services.databaseManager.start()

    container.server = serverModule(container)
    await container.server.start()
  }

  const stop = async () => {
    await container.server.stop()
    await container.services.databaseManager.stop()
  }

  const getContainer = () => container

  process.on('SIGTERM', stop)
  process.on('SIGINT', stop)

  return {
    getContainer,
    start,
    stop,
  }
}
