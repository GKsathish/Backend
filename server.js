const express = require('express');
const bodyParser = require('body-parser');
const { createPool } = require('mysql');
const cors = require('cors');

const connection = createPool({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'RMT_PORTAL',
  connectionLimit: 10,
});

const app = express();
const port = 8080;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Enable CORS
app.use(cors());

// User Registration API
app.post('/register', (req, res) => {
  const { username, email, password } = req.body;
  const create_datetime = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const sql = 'INSERT INTO users (username, email, password, create_datetime) VALUES (?, ?, ?, ?)';
  connection.query(sql, [username, email, password, create_datetime], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error creating user');
    } else {
      res.status(201).send('User created successfully');
    }
  });
});

// User Login API
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const sql = 'SELECT username, email FROM users WHERE email = ? AND password = ?';
  connection.query(sql, [email, password], (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error logging in');
    } else {
      if (rows.length > 0) {
        // User found, return user data
        const userData = {
          username: rows[0].username,
          email: rows[0].email
        };
        res.status(200).json({
          status: 200,
          message: 'Login success',
          data: userData
        });
      } else {
        // User not found or credentials mismatch
        res.status(404).json({
          status: 404,
          message: 'User not found or credentials mismatch'
        });
      }
    }
  });
});

// Read all users
app.get('/users', (req, res) => {
  connection.query('SELECT * FROM users', (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error fetching users');
    } else {
      res.status(200).json(rows);
    }
  });
});

// Update user
app.put('/users/:id', (req, res) => {
  const { username, email, password, create_datetime } = req.body;
  const userId = req.params.id;
  const sql = 'UPDATE users SET username = ?, email = ?, password = ?, create_datetime = ? WHERE id = ?';
  connection.query(sql, [username, email, password, create_datetime, userId], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error updating user');
    } else {
      res.status(200).send('User updated successfully');
    }
  });
});

// Delete user
app.delete('/users/:id', (req, res) => {
  const userId = req.params.id;
  const sql = 'DELETE FROM users WHERE id = ?';
  connection.query(sql, [userId], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error deleting user');
    } else {
      res.status(200).send('User deleted successfully');
    }
  });
});

// Handle preflight requests
app.options('*', cors());

// Start server
app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
