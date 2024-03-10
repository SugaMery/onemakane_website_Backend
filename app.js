const express = require('express');
const mysql = require('mysql2');
const app = express();
const port = 3000;

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root', // Your MySQL username
    password: '', // Your MySQL password
    database: 'onemakan_db', // Your MySQL database name
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

app.get('/', (req, res) => {
    res.send('Hello, this is your Node.js server!');
});

// Sample method to fetch all categories
app.get('/categories', (req, res) => {
    const query = `
    SELECT c.id_categorie, c.nom_categorie,
           sc.id_sous_categorie, sc.nom_sous_categorie,
           ssc.id_soussous_categorie, ssc.nom_soussous_categorie
    FROM categories c
    LEFT JOIN sous_categories sc ON c.id_categorie = sc.id_categorie
    LEFT JOIN soussous_categories ssc ON sc.id_sous_categorie = ssc.id_sous_categorie
  `;

    pool.query(query, (error, results) => {
        if (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            const categories = [];

            results.forEach(row => {
                const category = categories.find(cat => cat.id_categorie === row.id_categorie);

                if (!category) {
                    // If category doesn't exist, create it
                    categories.push({
                        id_categorie: row.id_categorie,
                        nom_categorie: row.nom_categorie,
                        sous_categories: [{
                            id_sous_categorie: row.id_sous_categorie,
                            nom_sous_categorie: row.nom_sous_categorie,
                            soussous_categories: row.id_soussous_categorie ? [{
                                id_soussous_categorie: row.id_soussous_categorie,
                                nom_soussous_categorie: row.nom_soussous_categorie
                            }] : []
                        }]
                    });
                } else {
                    const sousCategorie = category.sous_categories.find(sc => sc.id_sous_categorie === row.id_sous_categorie);

                    if (!sousCategorie) {
                        // If subcategory doesn't exist, create it
                        category.sous_categories.push({
                            id_sous_categorie: row.id_sous_categorie,
                            nom_sous_categorie: row.nom_sous_categorie,
                            soussous_categories: row.id_soussous_categorie ? [{
                                id_soussous_categorie: row.id_soussous_categorie,
                                nom_soussous_categorie: row.nom_soussous_categorie
                            }] : []
                        });
                    } else if (row.id_soussous_categorie) {
                        // If sub-subcategory exists, add it to the subcategory
                        sousCategorie.soussous_categories.push({
                            id_soussous_categorie: row.id_soussous_categorie,
                            nom_soussous_categorie: row.nom_soussous_categorie
                        });
                    }
                }
            });

            res.json(categories);
        }
    });
});
// Sample method to add a new category
app.post('/categories', (req, res) => {
    const { nom_categorie } = req.body;

    pool.query('INSERT INTO categories (nom_categorie) VALUES (?)', [nom_categorie], (error, results) => {
        if (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.json({ message: 'Category added successfully' });
        }
    });
});

// You can create similar methods for other tables and operations
// Sample method to fetch all sous categories for a given category
app.get('/sous_categories/:id_categorie', (req, res) => {
    const { id_categorie } = req.params;

    pool.query('SELECT * FROM sous_categories WHERE id_categorie = ?', [id_categorie], (error, results) => {
        if (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.json(results);
        }
    });
});

// Sample method to add a new sous categorie
app.post('/sous_categories', (req, res) => {
    const { id_categorie, nom_sous_categorie } = req.body;

    pool.query('INSERT INTO sous_categories (id_categorie, nom_sous_categorie) VALUES (?, ?)', [id_categorie, nom_sous_categorie], (error, results) => {
        if (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.json({ message: 'Sous Categorie added successfully' });
        }
    });
});

// Similar methods can be created for soussous_categories, utilisateurs, annonces, paiements, transactions

// Sample method to fetch user information by email
app.get('/utilisateurs/:email', (req, res) => {
    const { email } = req.params;

    pool.query('SELECT * FROM utilisateurs WHERE email = ?', [email], (error, results) => {
        if (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.json(results);
        }
    });
});

// Sample method to add a new user
app.post('/utilisateurs', (req, res) => {
    const { email, mot_de_passe, type_profil } = req.body;

    pool.query('INSERT INTO utilisateurs (email, mot_de_passe, type_profil) VALUES (?, ?, ?)', [email, mot_de_passe, type_profil], (error, results) => {
        if (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.json({ message: 'User added successfully' });
        }
    });
});

// You can continue to create similar methods for other tables and operations


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
