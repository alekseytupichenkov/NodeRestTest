const { UnauthorizedError } = require('express-jwt')

module.exports = (logger) => (err, req, res, next) => {
  if (err instanceof UnauthorizedError) {
    logger.error(err)
    res.status(401).send(err)
  } else {
    next(err)
  }
}
