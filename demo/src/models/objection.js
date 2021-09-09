const Objection = require('objection')
const knex = require('../knex')

Objection.Model.knex(knex)

module.exports = Objection
