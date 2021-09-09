const Ajv = require('ajv')
const OError = require('@overleaf/o-error')

function expressify(fn) {
  return (req, res, next) => {
    fn(req, res, next).catch(next)
  }
}
exports.expressify = expressify

class ValidationError extends OError {
  constructor(message, errors, schema) {
    super(message)
    this.errors = errors
    this.schema = schema
  }
}
exports.ValidationError = ValidationError

function validateBody(jsonSchema, ajvOptions) {
  const ajv = new Ajv(ajvOptions)
  const validate = ajv.compile(jsonSchema)
  return (req, res, next) => {
    if (!req.route) return next()
    if (validate(req.body)) return next()
    next(
      new ValidationError(
        'validateBody failed',
        validate.errors,
        validate.schema
      )
    )
  }
}
exports.validateBody = validateBody
