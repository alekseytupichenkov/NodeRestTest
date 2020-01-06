const path = require('path')
const winston = require('winston')

const makeErrorMessagePropertyEnumerable = winston.format((info) => {
  if (info instanceof Error) {
    Object.defineProperty(info, 'message', {
      enumerable: true,
    })
  }

  return info
})

module.exports = (folderPath, filePrefix) => winston.createLogger({
  level: 'debug',
  format: makeErrorMessagePropertyEnumerable(),
  transports: [
    new winston.transports.File({
      format: winston.format.json(),
      filename: path.join(folderPath, `${filePrefix}.log`),
    }),
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
})
