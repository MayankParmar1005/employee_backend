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

// Add this test connection check to log explicitly in Railway logs
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Neon Database connection failed on startup:', err.message);
  } else {
    console.log('✅ Neon Database connected successfully at:', res.rows[0].now);
  }
});

module.exports = pool;