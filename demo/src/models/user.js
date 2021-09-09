const { Model } = require('./objection')

// This is the one from the HTML5 spec.
// https://html.spec.whatwg.org/multipage/input.html#valid-e-mail-address
const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

const EMAIL_SCHEMA = {
  type: 'string',
  minLength: 1,
  maxLength: 255,
  pattern: EMAIL_REGEX.source,
}

const PASSWORD_SCHEMA = {
  name: 'password',
  type: 'string',
  minLength: 1,
  maxLength: 72, // align with bcrypt limit (which is in bytes)
}

class User extends Model {
  static get tableName() {
    return 'users'
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['email', 'passwordDigest'],
      properties: {
        id: { type: 'integer' },
        email: EMAIL_SCHEMA,
        passwordDigest: { type: 'string' },
      },
    }
  }
}

User.EMAIL_SCHEMA = EMAIL_SCHEMA
User.PASSWORD_SCHEMA = PASSWORD_SCHEMA

module.exports = User
