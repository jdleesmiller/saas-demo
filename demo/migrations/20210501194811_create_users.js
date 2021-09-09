exports.up = async function (knex) {
  await knex.schema.createTable('users', function (table) {
    table.increments()
    table.string('email').notNullable().unique()
    table.string('password_digest').notNullable()
  })
}

exports.down = async function (knex) {
  await knex.schema.dropTable('users')
}
