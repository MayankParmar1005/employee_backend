const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: '192.168.0.62',
  database: 'Employee',
  password: 'shree',
  port: 5432
});

module.exports = pool;