require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db/db');
console.log("=== DB.JS WAS IMPORTED SUCCESSFULLY ==="); // 👈 ADD THIS

const app = express();

// Middleware
app.use(cors());                  // Allows cross-origin requests from Angular
app.use(express.json());

console.log("=== SERVER IS STARTING UP ==="); // 👈 ADD THIS

const employeeRoutes =
require('./routes/employee.routes');

app.use('/api/employees', employeeRoutes);

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