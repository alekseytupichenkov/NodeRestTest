class BaseController {
  createResponse(success, message, data = {}) {
    return {
      success,
      message,
      data,
    }
  }
}

module.exports = BaseController
