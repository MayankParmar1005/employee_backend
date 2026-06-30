const employees = require('../data/employees');
const pool = require('../db/db');

// GET ALL
// exports.getEmployees = (req, res) => {
//   res.json(employees);
// };


// api for get all employee list
exports.getEmployees = async (req, res) => {

  try {

    const result = await pool.query( 'SELECT * FROM staff ORDER BY id');

    res.json(result.rows);

  } catch(error) {

    console.error(error);

    res.status(500).json({ message: 'Server Error'});

  }

};

// GET employee by id
exports.getEmployeeById = async(req, res) => {
  const id = parseInt(req.params.id);

  try {

    const result = await pool.query( 'SELECT * FROM staff WHERE id = ' + id);

    if (result.rows.length === 0) {

      return res.status(404).json({
        message: 'Employee not found'
      });

    }

    res.json(result.rows[0]);

  } catch(error) {

    console.error(error);

    res.status(500).json({ message: 'Server Error'});

  }
};

// api for create new staff member
exports.createStaff = async (req, res) => {

  try {

    // 1. Destructure the fields exactly as they come from your frontend/JSON payload
    const { name, email, phone, role, specialization, join_date, status, rating } = req.body;

    // 2. Insert into the 'staff' table using the correct snake_case column names
    const result = await pool.query(
        `INSERT INTO staff(name, email, phone, role, specialization, join_date, status, rating)
         VALUES($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [name, email, phone, role, specialization, join_date, status, rating]
    );

    // 3. Return the newly created staff record
    res.status(201).json(result.rows[0]);

  } catch(error) {

    console.error(error);

    res.status(500).json({
      message: 'Server Error'
    });

  }

};

// api for edit staff member
exports.updateStaff = async (req, res) => {

  try {

    const id = req.params.id;
    
    // 1. Destructure the new salon staff fields from the request body
    const { name, email, phone, role, specialization, join_date, status, rating } = req.body;

    // 2. Update the 'staff' table using the correct snake_case column names
    const result = await pool.query(
      `UPDATE staff
       SET name = $1,
           email = $2,
           phone = $3,
           role = $4,
           specialization = $5,
           join_date = $6,
           status = $7,
           rating = $8
       WHERE id = $9
       RETURNING *`,
      [name, email, phone, role, specialization, join_date, status, rating, id]
    );

    // 3. Check if the staff member exists
    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Staff member not found'
      });
    }

    // 4. Return the updated staff record
    res.json(result.rows[0]);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: 'Server Error'
    });

  }

};

// api for delete employee

exports.deleteEmployee = async (req, res) => {

  try {

    const id = req.params.id;

    await pool.query('DELETE FROM staff WHERE id=$1',[id]);

    res.json({
      message: 'Deleted successfully'
    });

  } catch(error){

    console.error(error);

    res.status(500).json({ message: 'Server Error'});

  }

};