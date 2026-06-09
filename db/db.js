// const { Pool } = require('pg');

// const pool = new Pool({
//   user: 'postgres',
//   host: '192.168.0.166',
//   database: 'Employee',
//   password: 'shree',
//   port: 5432
// });

// module.exports = pool;

const { Pool } = require('pg');

// Railway automatically provides process.env.DATABASE_URL if you added it to the Variables tab
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: true // Neon requires secure SSL connections
  }
});

module.exports = pool;