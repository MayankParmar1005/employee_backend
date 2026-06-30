const pool = require('../db/db'); 

// 1. LIST ALL CUSTOMERS WITH AGGREGATE METRICS
exports.getCustomers = async (req, res) => {
    try {
      const result = await pool.query(
        `
        SELECT 
            c.id,
            c.name,
            c.mobile,
            c.email,
            c.created_at,
            COUNT(a.id)::INT AS visits,                                     -- Counts total appointments
            COALESCE(SUM(CASE WHEN a.status = 'completed' THEN a.total_amount ELSE 0 END), 0)::FLOAT AS total_spent, -- Sums only completed revenue
            MAX(a.appointment_date) AS last_visit
        FROM customers c
        LEFT JOIN appointments a ON c.id = a.customer_id
        GROUP BY c.id
        ORDER BY c.name ASC
        `
      );
      res.json(result.rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching customers' });
    }
  };

// 2. VIEW SINGLE CUSTOMER DETAIL BY ID
exports.getCustomerById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await pool.query('SELECT * FROM customers WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// 3. ADD NEW CUSTOMER
exports.createCustomer = async (req, res) => {
  try {
    const { name, mobile, email } = req.body;

    // Check if mobile number already exists to throw a clean validation message
    const mobileCheck = await pool.query('SELECT id FROM customers WHERE mobile = $1', [mobile]);
    if (mobileCheck.rows.length > 0) {
      return res.status(400).json({ message: 'A customer with this mobile number already exists.' });
    }

    const result = await pool.query(
      `INSERT INTO customers (name, mobile, email) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [name, mobile, email]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// 4. EDIT CUSTOMER DETAILS
exports.updateCustomer = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, mobile, email } = req.body;

    // Verify if the edited mobile number is being used by *another* customer record
    const mobileCheck = await pool.query('SELECT id FROM customers WHERE mobile = $1 AND id != $2', [mobile, id]);
    if (mobileCheck.rows.length > 0) {
      return res.status(400).json({ message: 'This mobile number is already taken by another customer.' });
    }

    const result = await pool.query(
      `UPDATE customers 
       SET name = $1, mobile = $2, email = $3 
       WHERE id = $4 
       RETURNING *`,
      [name, mobile, email, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};


// 5. DELETE CUSTOMER (WITH EXPLICIT APPOINTMENT CHECK)
exports.deleteCustomer = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    // Step 1: Explicitly check if the customer has ANY records in the appointments table
    const appointmentCheck = await pool.query(
      'SELECT id FROM appointments WHERE customer_id = $1 LIMIT 1',
      [id]
    );

    if (appointmentCheck.rows.length > 0) {
      // If even 1 record exists (regardless of status), block the deletion immediately
      return res.status(400).json({ 
        message: 'There is an appointment history for this user. You cannot delete this customer.' 
      });
    }

    // Step 2: Proceed to delete since no appointment records were found
    const result = await pool.query('DELETE FROM customers WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json({ message: 'Customer deleted successfully' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// api to check if a mobile number or email is already taken
exports.checkAvailability = async (req, res) => {
    try {
      const { field, value } = req.query; // Expects e.g., ?field=mobile&value=9898948827
  
      // Safety check to prevent SQL injection or bad queries
      if (!['mobile', 'email'].includes(field)) {
        return res.status(400).json({ message: 'Invalid validation field' });
      }
  
      // Dynamic query safely choosing the column name using a strict whitelist
      const result = await pool.query(
        `SELECT id, name FROM customers WHERE ${field} = $1`,
        [value]
      );
  
      if (result.rows.length > 0) {
        return res.status(200).json({ 
          isAvailable: false, 
          message: `This ${field} is already registered to ${result.rows[0].name}.` 
        });
      }
  
      // The value is completely unique and safe to use
      res.status(200).json({ 
        isAvailable: true 
      });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
    }
  };

  // api to get detailed appointment history for a specific customer popup
  exports.getCustomerAppointmentHistory = async (req, res) => {
    try {
      const customerId = parseInt(req.params.id);

      // Fetch the specific columns needed for the frontend popup table
      const result = await pool.query(
        `
        SELECT 
            a.id,
            s.name AS staff_name,          -- Pulls staff name from staff table
            a.service_id,
            srv.name AS service_name,
            a.appointment_date,
            a.appointment_time,
            a.total_amount::FLOAT AS price, -- Casted to float for direct Angular number mapping
            a.status
        FROM appointments a
        LEFT JOIN staff s ON a.staff_id = s.id
        LEFT JOIN services srv ON a.service_id = srv.id -- New join link
        WHERE a.customer_id = $1
        ORDER BY a.appointment_date DESC, a.appointment_time DESC
        `,
        [customerId]
      );

      // Even if the list is empty, return a 200 with an empty array []
      res.json(result.rows);

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
    }
  };