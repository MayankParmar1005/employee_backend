const employees = require('../data/employees');
const pool = require('../db/db');

// GET ALL
// exports.getEmployees = (req, res) => {
//   res.json(employees);
// };


// api for get all employee list
exports.getEmployees = async (req, res) => {

  try {

    const result = await pool.query( 'SELECT * FROM employees ORDER BY id');

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

    const result = await pool.query( 'SELECT * FROM employees WHERE id = ' + id);

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

// api for create new employee
exports.createEmployee = async (req, res) => {

  try {

    const { name, designation, age, email, gender, hobbies, languages } = req.body;

    const result = await pool.query(
        `INSERT INTO employees(name, designation, age, email, gender, hobbies, languages)
         VALUES($1,$2,$3,$4,$5,$6,$7)
         RETURNING *`,
        [name, designation, age, email, gender, hobbies, languages]
    );

    res.status(201).json(result.rows[0]);

  } catch(error) {

    console.error(error);

    res.status(500).json({
      message: 'Server Error'
    });

  }

};

// api for edit employee

exports.updateEmployee = async (req, res) => {

  try {

    const id = req.params.id;
    const { name, designation, age , email, gender, hobbies, languages } = req.body;

    const result = await pool.query(
      `UPDATE employees
       SET name = $1,
           designation = $2,
           age = $3,
           email = $4,
           gender = $5,
           hobbies = $6,
           languages = $7
       WHERE id = $8
       RETURNING *`,
      [name, designation, age, email, gender, hobbies, languages, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Employee not found'
      });
    }

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

    await pool.query('DELETE FROM employees WHERE id=$1',[id]);

    res.json({
      message: 'Deleted successfully'
    });

  } catch(error){

    console.error(error);

    res.status(500).json({ message: 'Server Error'});

  }

};