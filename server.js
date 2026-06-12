require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db/db');

// const cron_job = require('./scheduler/reminder'); // this is for run cron job

const app = express();

// Middleware
app.use(cors());                  // Allows cross-origin requests from Angular
app.use(express.json());

const employeeRoutes = require('./routes/employee.routes');
const authRoutes = require('./routes/auth.routes');

app.use('/api/employees', employeeRoutes);
app.use('/api/auth', authRoutes);

// const PORT = 3000;
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});


// pool.query('SELECT NOW()', (err, res) => {

//   if (err) {
//     console.error(err);
//   } else {
//     console.log(res.rows);
//   }

// });