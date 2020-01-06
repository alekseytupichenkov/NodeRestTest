const BaseController = require('./BaseController')

const pageSize = 5

class TaskController extends BaseController {
  constructor(logger, Task) {
    super()
    this.logger = logger
    this.Task = Task
  }

  async getAction(req, res) {
    // todo: validate request parameters
    const page = req.query.page || 1
    const orderField = req.query.order_field || 'createdAt'
    const orderDirection = req.query.order_direction || 'ASC'

    const tasks = await this.Task.findAll({
      limit: pageSize,
      offset: (page - 1) * pageSize,
      where: {
        userId: req.user.id,
      },
      order: [
        [orderField, orderDirection],
      ],
    })

    res.status(200).json(this.createResponse(true, '', { tasks }))
  }

  async createAction(req, res) {
    const { title, dueDate, priority } = req.body

    try {
      const task = await this.Task.create({
        title, dueDate, priority, userId: req.user.id,
      })

      return res.status(200).json(this.createResponse(true, '', { id: task.id }))
    } catch (err) {
      this.logger.error(err)
      return res.status(500).json(this.createResponse(false, err.message))
    }
  }

  async updateAction(req, res) {
    const {
      id, title, dueDate, priority,
    } = req.body

    try {
      const task = await this.Task.findOne({ where: { id, userId: req.user.id } })
      if (!task) {
        return res.status(404).json(this.createResponse(false, 'Task not found'))
      }

      task.update({ title, dueDate, priority })

      return res.status(200).json(this.createResponse(true))
    } catch (err) {
      this.logger.error(err)
      return res.status(500).json(this.createResponse(false, err.message))
    }
  }

  async deleteAction(req, res) {
    const { id } = req.body

    try {
      const task = await this.Task.findOne({ where: { id, userId: req.user.id } })
      if (!task) {
        return res.status(404).json(this.createResponse(false, 'Task not found'))
      }
      task.destroy()

      return res.status(200).json(this.createResponse(true))
    } catch (err) {
      this.logger.error(err)
      return res.status(500).json(this.createResponse(false, err.message))
    }
  }
}

module.exports = TaskController
