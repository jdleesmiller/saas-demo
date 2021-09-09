const baseConfig = {
  client: 'postgres',
  connection: {
    port: process.env.POSTGRES_SERVICE_PORT,
    host: process.env.POSTGRES_SERVICE_HOST,
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD || '',
  },
  pool: {
    min: parseInt(process.env.DATABASE_POOL_MIN || '1', 10),
    max: parseInt(process.env.DATABASE_POOL_MAX || '10', 10),
  },
}

module.exports = {
  development: baseConfig,
  test: baseConfig,
}
