const pool = require('../db/db');

exports.createAppointment = async (req, res) => {
    // Use a client from the pool to handle multi-query transactions safely
    const client = await pool.connect();
  
    try {
      const { 
        name, 
        mobile, 
        email, 
        staff_id, 
        service_name, 
        appointment_date, 
        appointment_time, 
        total_amount 
      } = req.body;
  
      // Start Transaction
      await client.query('BEGIN');
  
      // Step 1: Check if customer already exists by mobile number
      const customerCheck = await client.query(
        'SELECT id FROM customers WHERE mobile = $1',
        [mobile]
      );
  
      let customerId;
  
      if (customerCheck.rows.length > 0) {
        // Customer exists, use the existing ID
        customerId = customerCheck.rows[0].id;
      } else {
        // Customer does not exist, create a new customer record
        const newCustomer = await client.query(
          `INSERT INTO customers (name, mobile, email) 
           VALUES ($1, $2, $3) 
           RETURNING id`,
          [name, mobile, email]
        );
        customerId = newCustomer.rows[0].id;
      }
  
      // Step 2: Insert the appointment using the customerId
      const appointmentResult = await client.query(
        `INSERT INTO appointments (
            customer_id, 
            staff_id, 
            service_name, 
            appointment_date, 
            appointment_time, 
            total_amount
         )
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [customerId, staff_id, service_name, appointment_date, appointment_time, total_amount]
      );
  
      // Commit Transaction if everything succeeds
      await client.query('COMMIT');
  
      // Respond with the newly created appointment details
      res.status(201).json(appointmentResult.rows[0]);
  
    } catch (error) {
      // Rollback changes if anything breaks along the way
      await client.query('ROLLBACK');
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
    } finally {
      // Always release the pool client back to the pool
      client.release();
    }
  };


  // Get appointment list
  exports.getAppointments = async (req, res) => {

    try {

        const result = await pool.query(
            `
            SELECT 
                a.id,
                a.customer_id,
                c.name AS customer_name,       -- Pulls name from customer table
                c.mobile AS customer_mobile,   -- Pulls mobile from customer table
                a.staff_id,
                s.name AS staff_name,          -- Pulls name from staff table
                a.service_name,
                a.appointment_date,
                a.appointment_time,
                a.status,
                a.total_amount,
                a.created_at
            FROM appointments a
            INNER JOIN customers c ON a.customer_id = c.id
            LEFT JOIN staff s ON a.staff_id = s.id
            ORDER BY a.appointment_date DESC, a.appointment_time DESC
            `
        );

        res.json(result.rows);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: 'Error fetching appointments'
        });

    }

};

// GET appointment detail by id
exports.getAppointmentById = async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    // Updated with JOINs and secured using parameterized input ($1)
    const result = await pool.query(
      `
      SELECT 
          a.id,
          a.customer_id,
          c.name AS customer_name,
          c.mobile AS customer_mobile,
          c.email AS customer_email,
          a.staff_id,
          s.name AS staff_name,
          a.service_name,
          a.appointment_date,
          a.appointment_time,
          a.status,
          a.total_amount,
          a.created_at
      FROM appointments a
      INNER JOIN customers c ON a.customer_id = c.id
      LEFT JOIN staff s ON a.staff_id = s.id
      WHERE a.id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Appointment not found'
      });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// api for editing appointment details (limited fields)
exports.updateAppointment = async (req, res) => {
  const id = parseInt(req.params.id); // The appointment ID from the URL

  try {
    // 1. Destructure ONLY the scheduling, service, and status fields
    const { 
      staff_id, 
      service_name, 
      appointment_date, 
      appointment_time, 
      status, 
      total_amount 
    } = req.body;

    // 2. Execute the update query on the appointments table
    const result = await pool.query(
      `UPDATE appointments 
       SET staff_id = $1, 
           service_name = $2, 
           appointment_date = $3, 
           appointment_time = $4, 
           status = $5,
           total_amount = $6
       WHERE id = $7
       RETURNING *`,
      [staff_id, service_name, appointment_date, appointment_time, status, total_amount, id]
    );

    // 3. Check if the appointment record exists
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        message: 'Appointment not found' 
      });
    }

    // 4. Respond with the successfully updated appointment record
    res.json(result.rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: 'Server Error' 
    });
  }
};

// api for looking up a customer by mobile number
exports.getCustomerByMobile = async (req, res) => {
  try {
    const { mobile } = req.params;

    const result = await pool.query(
      'SELECT id, name, email FROM customers WHERE mobile = $1',
      [mobile]
    );

    if (result.rows.length === 0) {
      // Return 200 with a clean message or null so frontend knows it's a new customer
      return res.status(200).json({ 
        exists: false, 
        customer: null 
      });
    }

    // Return the existing customer details
    res.status(200).json({
      exists: true,
      customer: result.rows[0]
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};