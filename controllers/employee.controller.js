const employees = require('../data/employees');
const pool = require('../db/db');

const fs = require('fs');
const path = require('path');

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

    // If a file was uploaded, catch its name; otherwise fallback to null or a default avatar
    const imageUrl = req.file ? req.file.filename : null;

    console.log(imageUrl);

    // 2. Insert into the 'staff' table using the correct snake_case column names
    const result = await pool.query(
        `INSERT INTO staff(name, email, phone, role, specialization, join_date, status, rating, image_url)
         VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [name, email, phone, role, specialization, join_date, status, rating, imageUrl]
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

    // 2. Fetch the existing record first to see if there's an old image name saved
    const existingStaff = await pool.query('SELECT image_url FROM staff WHERE id = $1', [id]);
    
    if (existingStaff.rows.length === 0) {
      // If a new file was uploaded but user doesn't exist, remove it to save disk space
      if (req.file) {
        fs.unlink(req.file.path, () => {});
      }
      return res.status(404).json({ message: 'Staff member not found' });
    }

    const oldImage = existingStaff.rows[0].image_url;
    let finalImageUrl = oldImage; // Default: keep the old image string if no new one is provided

    // 3. If a new file was uploaded via Multer, swap them out
    if (req.file) {
      finalImageUrl = req.file.filename; // Use the brand-new unique filename string

      // Delete the old file from the server disk if it exists
      if (oldImage) {
        const oldFilePath = path.join(__dirname, '../uploads/', oldImage);
        fs.unlink(oldFilePath, (err) => {
          if (err) console.error('Error deleting old image file:', err);
        });
      }
    }
    
    // 4. Update the 'staff' table using the correct snake_case column names
    const result = await pool.query(
      `UPDATE staff
       SET name = $1,
           email = $2,
           phone = $3,
           role = $4,
           specialization = $5,
           join_date = $6,
           status = $7,
           rating = $8,
           image_url = $9
       WHERE id = $10
       RETURNING *`,
      [name, email, phone, role, specialization, join_date, status, rating, finalImageUrl, id]
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