const pool = require('../db/db');

// for encrypt password
const bcrypt = require('bcrypt');

// for jwt token
const jwt = require('jsonwebtoken');


// api for user registration
exports.register = async (req, res) => {

    console.log('register api call');
    const { name, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
        `INSERT INTO users(name,email,password)
        VALUES($1,$2,$3)
        RETURNING *`,
        [name, email, hashedPassword]
    );

    res.json(result.rows[0]);
  };

  // for login api

  exports.login = async (req, res) => {

    const { email, password } = req.body;

    const result = await pool.query(
      `SELECT * FROM users WHERE email=$1`,
      [email]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({
        message: 'Invalid Email'
      });
    }

    const match = await bcrypt.compare(
      password,
      user.password
    );

    if (!match) {
      return res.status(401).json({
        message: 'Invalid Password'
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email
      },
      'mySecretKey',
      {
        expiresIn: '1d'
      }
    );

    res.json({ token });
  };