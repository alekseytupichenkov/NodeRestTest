const jwt = require('jsonwebtoken')
const BaseController = require('./BaseController')

class SecurityController extends BaseController {
  constructor(config, logger, User, passwordHasher) {
    super()
    this.config = config
    this.logger = logger
    this.User = User
    this.passwordHasher = passwordHasher
  }

  async loginAction(req, res) {
    const { email, password } = req.body

    const user = await this.User.findOne({ where: { email } })
    if (user instanceof this.User) {
      if (this.passwordHasher.check(password, user.password)) {
        const token = this.generateToken(user)

        res.json(this.createResponse(true, null, { token }))
        return
      }
    }

    this.logger.warn('Incorrect credentials')
    res.status(401).json(this.createResponse(false, 'Incorrect credentials'))
  }

  async registerAction(req, res) {
    const { email, password } = req.body

    try {
      const user = await this.User.create({ email, password })
      const token = this.generateToken(user)

      return res.status(200).json(this.createResponse(true, '', { token, id: user.id }))
    } catch (err) {
      this.logger.error(err)
      return res.status(500).json(this.createResponse(false, err.message))
    }
  }

  generateToken(user) {
    return jwt.sign({ id: user.id, email: user.email }, this.config.secret, { expiresIn: 129600 })
  }
}

module.exports = SecurityController
