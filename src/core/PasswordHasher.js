const bcrypt = require('bcryptjs')

class PasswordHasher {
  generate(string) {
    const salt = bcrypt.genSaltSync()
    return bcrypt.hashSync(string, salt)
  }

  check(string, hash) {
    return bcrypt.compareSync(string, hash)
  }
}

module.exports = PasswordHasher
