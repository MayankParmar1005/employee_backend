const pool = require('../db/db');

// 1. LIST ALL SERVICES
exports.getServices = async (req, res) => {
  try {
    const result = await pool.query(
    //   'SELECT id, name, category, duration, price::FLOAT, description, status, created_at FROM services ORDER BY category ASC, name ASC'
      'SELECT id, name, category, duration, price::FLOAT, description, status, created_at FROM services ORDER BY id ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching services' });
  }
};

// 2. VIEW SINGLE SERVICE BY ID
exports.getServiceById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await pool.query(
      'SELECT id, name, category, duration, price::FLOAT, description, status, created_at FROM services WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// 3. ADD NEW SERVICE
exports.createService = async (req, res) => {
  try {
    const { name, category, duration, price, description, status } = req.body;

    // Validation: Check for duplicate service names
    const nameCheck = await pool.query('SELECT id FROM services WHERE name = $1', [name]);
    if (nameCheck.rows.length > 0) {
      return res.status(400).json({ message: 'A service with this name already exists.' });
    }

    const result = await pool.query(
      `INSERT INTO services (name, category, duration, price, description, status) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id, name, category, duration, price::FLOAT, description, status, created_at`,
      [name, category, parseInt(duration), price, description, status || 'active']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// 4. EDIT SERVICE DETAILS
exports.updateService = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, category, duration, price, description, status } = req.body;

    // Check if the modified name is taken by another service record
    const nameCheck = await pool.query('SELECT id FROM services WHERE name = $1 AND id != $2', [name, id]);
    if (nameCheck.rows.length > 0) {
      return res.status(400).json({ message: 'This service name is already taken by another service.' });
    }

    const result = await pool.query(
      `UPDATE services 
       SET name = $1, category = $2, duration = $3, price = $4, description = $5, status = $6 
       WHERE id = $7 
       RETURNING id, name, category, duration, price::FLOAT, description, status, created_at`,
      [name, category, parseInt(duration), price, description, status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// 5. DELETE SERVICE
exports.deleteService = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const result = await pool.query('DELETE FROM services WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};