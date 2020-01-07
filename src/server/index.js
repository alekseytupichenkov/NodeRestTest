const bodyParser = require('body-parser')
const express = require('express')
const enableDestroy = require('server-destroy')
const helmet = require('helmet')
const expressJwt = require('express-jwt')
const cors = require('cors')
const swaggerJSDoc = require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express')
const securityErrorHandler = require('./middlewares/securityErrorHandler')
const SecurityController = require('./controllers/SecurityController')
const TaskController = require('./controllers/TaskController')

const swaggerJSDocConfig = {
  swaggerDefinition: {
    info: {
      title: 'Test application',
      version: '1.0.0',
      description: 'A sample API',
    },
    securityDefinitions: {
      Bearer: {
        type: 'apiKey',
        name: 'Authorization',
        in: 'header',
      },
    },
  },
  apis: ['src/server/controllers/*Controller.js'],
}


module.exports = (container) => {
  const { config, services: { logger } } = container

  let server
  let listener

  const start = async () => {
    const controllers = {
      securityController: new SecurityController(config.server.jwt, logger, container.models.User, container.services.passwordHasher),
      taskController: new TaskController(logger, container.models.Task),
    }

    server = express()
    server.use(cors())
    server.use(helmet())

    server.use(bodyParser.urlencoded({ extended: false }))
    server.use(bodyParser.json())
    server.use(expressJwt(config.server.jwt).unless({ path: ['/login', '/register', /^\/api-docs.*/] }))
    server.use(securityErrorHandler(logger))

    server.post('/login', controllers.securityController.loginAction.bind(controllers.securityController))
    server.post('/register', controllers.securityController.registerAction.bind(controllers.securityController))
    server.get('/task', controllers.taskController.getAction.bind(controllers.taskController))
    server.post('/task', controllers.taskController.createAction.bind(controllers.taskController))
    server.patch('/task', controllers.taskController.updateAction.bind(controllers.taskController))
    server.delete('/task', controllers.taskController.deleteAction.bind(controllers.taskController))

    const swaggerSpec = swaggerJSDoc(swaggerJSDocConfig)
    server.get('/api-docs.json', (req, res) => {
      res.setHeader('Content-Type', 'application/json')
      res.send(swaggerSpec)
    })
    server.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

    listener = server.listen(config.server.port, () => {
      logger.info('Server started', { port: config.server.port })
    })
    enableDestroy(listener)
  }

  const stop = async () => {
    await listener.destroy()
    await new Promise((resolve) => {
      listener.close(resolve)
    })
    logger.info('Server stopped')
  }

  return {
    start,
    stop,
  }
}
