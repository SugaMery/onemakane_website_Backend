// Require necessary modules
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');

// Create an instance of Express
const app = express();

// Set up middleware for parsing JSON
app.use(bodyParser.json());

// Create a MySQL connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'onemakane_website'
});

// Connect to the database
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to database: ' + err.stack);
    return;
  }
  console.log('Connected to database as ID ' + connection.threadId);
});

// Define a route for creating a category
app.post('/categories', (req, res) => {
  const { name, iconPath, parentId, type } = req.body;

  // Insert the new category into the database
  const sql = 'INSERT INTO Categories (name, icon_path, parent_id, type) VALUES (?, ?, ?, ?)';
  connection.query(sql, [name, iconPath, parentId, type], (err, result) => {
    if (err) {
      console.error('Error creating category: ' + err.message);
      res.status(500).send('Error creating category');
      return;
    }
    console.log('Category created with ID: ' + result.insertId);
    res.status(201).json({ id: result.insertId, name, iconPath, parentId, type });
  });
});


// Define a route for fetching all categories
app.get('/categories', (req, res) => {
    // Select all categories from the database
    const sql = 'SELECT * FROM Categories';
    connection.query(sql, (err, results) => {
      if (err) {
        console.error('Error fetching categories: ' + err.message);
        res.status(500).send('Error fetching categories');
        return;
      }
      console.log('Categories fetched successfully');
      res.status(200).json(results);
    });
  });

  
// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
