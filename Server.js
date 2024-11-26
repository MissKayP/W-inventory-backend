require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 5002; // Allow dynamic port configuration

// Middleware setup
app.use(cors({ origin: 'http://localhost:3000' })); // Enable CORS for frontend
app.use(bodyParser.json()); // Parse incoming JSON requests

// MySQL database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'test',
});

// Connect to the MySQL database
db.connect(err => {
  if (err) {
    console.error("Error connecting to the database:", err.message);
    process.exit(1);
  }
  console.log('Connected to MySQL Database');
});

// Middleware to log all incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Routes for users
app.route('/api/users')
  // Get all users
  .get((req, res) => {
    db.query('SELECT * FROM users', (err, results) => {
      if (err) {
        console.error("Error fetching users:", err.message);
        return res.status(500).json({ error: 'Failed to fetch users' });
      }
      res.json(results);
    });
  })
  // Add a new user
  .post((req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    db.query(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, password],
      (err, results) => {
        if (err) {
          console.error("Error adding user:", err.message);
          return res.status(500).json({ error: 'Failed to add user' });
        }
        res.json({ message: 'User added successfully!', userId: results.insertId });
      }
    );
  });

// Routes for users by ID
app.route('/api/users/:id')
  // Update a user
  .put((req, res) => {
    const { id } = req.params;
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    db.query(
      'UPDATE users SET username = ?, password = ? WHERE id = ?',
      [username, password, id],
      (err, results) => {
        if (err) {
          console.error("Error updating user:", err.message);
          return res.status(500).json({ error: 'Failed to update user' });
        }
        if (results.affectedRows === 0) {
          return res.status(404).json({ error: 'User not found' });
        }
        res.json({ message: 'User updated successfully' });
      }
    );
  })
  // Delete a user
  .delete((req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM users WHERE id = ?', [id], (err, results) => {
      if (err) {
        console.error("Error deleting user:", err.message);
        return res.status(500).json({ error: 'Failed to delete user' });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ message: 'User deleted successfully' });
    });
  });

// Routes for products
app.route('/api/products')
  // Get all products
  .get((req, res) => {
    db.query('SELECT * FROM products', (err, results) => {
      if (err) {
        console.error("Error fetching products:", err.message);
        return res.status(500).json({ error: 'Failed to fetch products' });
      }
      res.json(results);
    });
  })
  // Add a new product
  .post((req, res) => {
    const { name, description, category, price, quantity } = req.body;
    if (!name || !category || price == null || quantity == null) {
      return res.status(400).json({ error: 'Name, category, price, and quantity are required' });
    }

    db.query(
      'INSERT INTO products (name, description, category, price, quantity) VALUES (?, ?, ?, ?, ?)',
      [name, description, category, price, quantity],
      (err, results) => {
        if (err) {
          console.error("Error adding product:", err.message);
          return res.status(500).json({ error: 'Failed to add product' });
        }
        res.json({ message: 'Product added successfully!', productId: results.insertId });
      }
    );
  });

// Routes for products by ID
app.route('/api/products/:id')
  // Update a product
  .put((req, res) => {
    const { id } = req.params;
    const { name, description, category, price, quantity } = req.body;
    if (!name || !category || price == null || quantity == null) {
      return res.status(400).json({ error: 'Name, category, price, and quantity are required' });
    }

    db.query(
      'UPDATE products SET name = ?, description = ?, category = ?, price = ?, quantity = ? WHERE id = ?',
      [name, description, category, price, quantity, id],
      (err, results) => {
        if (err) {
          console.error("Error updating product:", err.message);
          return res.status(500).json({ error: 'Failed to update product' });
        }
        if (results.affectedRows === 0) {
          return res.status(404).json({ error: 'Product not found' });
        }
        res.json({ message: 'Product updated successfully' });
      }
    );
  })
  // Delete a product
  .delete((req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM products WHERE id = ?', [id], (err, results) => {
      if (err) {
        console.error("Error deleting product:", err.message);
        return res.status(500).json({ error: 'Failed to delete product' });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.json({ message: 'Product deleted successfully' });
    });
  });

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
