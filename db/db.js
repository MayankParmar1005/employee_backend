// for local use below code
// const { Pool, types } = require('pg');

// types.setTypeParser(1082,(value)=>value);

// const pool = new Pool({
//   user: 'postgres',
//   host: '192.168.1.13',
//   database: 'Employee',
//   password: 'shree',
//   port: 5432
// });

// module.exports = pool;

// for live api use below code
const { Pool, types } = require('pg');

types.setTypeParser(1082,(value)=>value);

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