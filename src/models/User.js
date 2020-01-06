const Sequelize = require('sequelize')

module.exports = (sequelize, passwordHasher) => {
  class User extends Sequelize.Model {}

  User.init({
    email: {
      type: Sequelize.STRING,
      validate: {
        isEmail: true,
      },
      unique: true,
    },
    password: {
      type: Sequelize.STRING,
    },
  }, {
    modelName: 'user',
    hooks: {
      beforeCreate(user) {
        // eslint-disable-next-line no-param-reassign
        user.password = passwordHasher.generate(user.password)
      },
    },
    sequelize,
  })

  return User
}
