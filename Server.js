require('dotenv').config(); // Load environment variables from .env
const express = require('express');
const { Client } = require('pg'); // PostgreSQL client
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 5002; // Allow dynamic port configuration

// Middleware setup
app.use(cors({ origin: 'http://localhost:3000' })); // Enable CORS for frontend
app.use(bodyParser.json()); // Parse incoming JSON requests

// PostgreSQL database connection
const client = new Client({
  host: process.env.DB_HOST, // e.g., dpg-ct431lq3esus73fc9ds0-a.render.com
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER, // e.g., your_database_username
  password: process.env.DB_PASSWORD, // e.g., your_database_password
  database: process.env.DB_NAME, // e.g., your_database_name
});

// Connect to PostgreSQL
client.connect(err => {
  if (err) {
    console.error("Error connecting to the database:", err.message);
    process.exit(1);
  }
  console.log('Connected to PostgreSQL Database');
});

// Middleware to log all incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Routes for users
app.route('/api/users')
  .get((req, res) => {
    client.query('SELECT * FROM users', (err, result) => {
      if (err) {
        console.error("Error fetching users:", err.message);
        return res.status(500).json({ error: 'Failed to fetch users' });
      }
      res.json(result.rows); // Return rows from query result
    });
  })
  .post((req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    client.query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id',
      [username, password],
      (err, result) => {
        if (err) {
          console.error("Error adding user:", err.message);
          return res.status(500).json({ error: 'Failed to add user' });
        }
        res.json({ message: 'User added successfully!', userId: result.rows[0].id });
      }
    );
  });

// Routes for products
app.route('/api/products')
  .get((req, res) => {
    client.query('SELECT * FROM products', (err, result) => {
      if (err) {
        console.error("Error fetching products:", err.message);
        return res.status(500).json({ error: 'Failed to fetch products' });
      }
      res.json(result.rows); // Return rows from query result
    });
  })
  .post((req, res) => {
    const { name, description, category, price, quantity } = req.body;
    if (!name || !category || price == null || quantity == null) {
      return res.status(400).json({ error: 'Name, category, price, and quantity are required' });
    }

    client.query(
      'INSERT INTO products (name, description, category, price, quantity) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [name, description, category, price, quantity],
      (err, result) => {
        if (err) {
          console.error("Error adding product:", err.message);
          return res.status(500).json({ error: 'Failed to add product' });
        }
        res.json({ message: 'Product added successfully!', productId: result.rows[0].id });
      }
    );
  });

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
