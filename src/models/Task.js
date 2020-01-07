const Sequelize = require('sequelize')

const priorities = ['low', 'normal', 'high']

module.exports = (sequelize, User) => {
  class Task extends Sequelize.Model {}
  Task.init({
    title: Sequelize.STRING,
    dueDate: {
      type: Sequelize.DATE,
      validate: {
        isDate: true,
      },
    },
    priority: {
      type: Sequelize.ENUM(...priorities),
      validate: {
        isIn: {
          args: [priorities],
        } ,
      },
    },
  }, {
    sequelize,
    modelName: 'task',
  }).belongsTo(User)

  return Task
}
