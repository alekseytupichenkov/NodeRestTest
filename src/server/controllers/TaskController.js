const BaseController = require('./BaseController')

const pageSize = 5

class TaskController extends BaseController {
  constructor(logger, Task) {
    super()
    this.logger = logger
    this.Task = Task
  }

  /**
   * @swagger
   * tags:
   *   name: Task
   *   description: Task CRUD
   */

  /**
   * @swagger
   * definitions:
   *   Task:
   *     properties:
   *       id:
   *         type: integer
   *       title:
   *         type: string
   *       dueDate:
   *         type: "string"
   *         format: "date-time"
   *       priority:
   *         type: string
   *       createdAt:
   *         type: "string"
   *         format: "date-time"
   *       updatedAt:
   *         type: "string"
   *         format: "date-time"
   *       userId:
   *         type: integer
   *   SuccessResponse:
   *     type: object
   *     properties:
   *       success:
   *         type: boolean
   *   ErrorResponse:
   *     type: object
   *     properties:
   *       success:
   *         type: boolean
   *       message:
   *         type: string
   */

  /**
   * @swagger
   * /task:
   *   get:
   *     security:
   *       - Bearer: []
   *     description: Get tasks
   *     tags: [Task]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: "page"
   *         type: string
   *         in: "query"
   *         default: 1
   *       - name: "order_field"
   *         type: string
   *         in: "query"
   *         enum:
   *           - "id"
   *           - "title"
   *           - "dueDate"
   *           - "priority"
   *           - "createdAt"
   *           - "updatedAt"
   *           - "userId"
   *         default: "createdAt"
   *       - name: "order_direction"
   *         type: string
   *         in: "query"
   *         enum:
   *           - "ASC"
   *           - "DESC"
   *         default: "ASC"
   *     responses:
   *       200:
   *         schema:
   *           type: object
   *           properties:
   *             success:
   *               type: boolean
   *             message:
   *               type: string
   *             data:
   *               type: array
   *               items:
   *                 $ref: "#/definitions/Task"
   *       500:
   *         schema:
   *           $ref: '#/definitions/ErrorResponse'
   */
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

  /**
   * @swagger
   * /task:
   *   post:
   *     security:
   *       - Bearer: []
   *     description: Remove task
   *     tags: [Task]
   *     produces:
   *       - application/json
   *     parameters:
   *       - in: "body"
   *         name: "body"
   *         required: true
   *         type: string
   *         schema:
   *           type: object
   *           properties:
   *             title:
   *               type: string
   *             dueDate:
   *               type: string
   *               format: date-time
   *             priority:
   *               type: string
   *               enum:
   *                  - "low"
   *                  - "normal"
   *                  - "high"
   *               default: "normal"
   *     responses:
   *       200:
   *         schema:
   *           type: object
   *           properties:
   *            success:
   *              type: boolean
   *            id:
   *              type: integer
   *       500:
   *         schema:
   *           $ref: '#/definitions/ErrorResponse'
   */
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

  /**
   * @swagger
   * /task:
   *   patch:
   *     security:
   *       - Bearer: []
   *     description: Remove task
   *     tags: [Task]
   *     produces:
   *       - application/json
   *     parameters:
   *       - in: "body"
   *         name: "body"
   *         required: true
   *         type: string
   *         schema:
   *           type: object
   *           properties:
   *             id:
   *               type: integer
   *             title:
   *               type: string
   *             dueDate:
   *               type: string
   *               format: date-time
   *             priority:
   *               type: string
   *               enum:
   *                  - "low"
   *                  - "normal"
   *                  - "high"
   *               default: "normal"
   *     responses:
   *       200:
   *         schema:
   *           $ref: '#/definitions/SuccessResponse'
   *       404:
   *         schema:
   *           $ref: '#/definitions/ErrorResponse'
   *       500:
   *         schema:
   *           $ref: '#/definitions/ErrorResponse'
   */
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

  /**
   * @swagger
   * /task:
   *   delete:
   *     security:
   *       - Bearer: []
   *     description: Remove task
   *     tags: [Task]
   *     produces:
   *       - application/json
   *     parameters:
   *       - in: "body"
   *         name: "body"
   *         required: true
   *         type: string
   *         schema:
   *           type: object
   *           properties:
   *             id:
   *               type: integer
   *     responses:
   *       200:
   *         schema:
   *           $ref: '#/definitions/SuccessResponse'
   *       404:
   *         schema:
   *           $ref: '#/definitions/ErrorResponse'
   *       500:
   *         schema:
   *           $ref: '#/definitions/ErrorResponse'
   */
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
