const express = require('express');
const postgres = require('postgres');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

const connectionString = process.env.URI;
const sql = postgres(connectionString);

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to check for API key
const apiKey = process.env.API_KEY; // Store your API key in .env

const authenticateApiKey = (req, res, next) => {
    const key = req.headers['x-api-key'];
    if (key && key === apiKey) {
        next(); // API key is valid, proceed to the next middleware or route handler
    } else {
        res.status(403).json({ error: 'Forbidden: Invalid API Key' });
    }
};

// Apply the API key authentication middleware to all routes
app.use(authenticateApiKey);

// Example route to get all users
app.get('/users', async (req, res) => {
    try {
        const users = await sql`SELECT * FROM users`;
        res.json(users);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Example route to create a new user
app.post('/users', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await sql`INSERT INTO users (email, password) VALUES (${email}, ${password}) RETURNING *`;
        res.status(201).json(result[0]);
    } catch (err) {
        console.error('Error creating user:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
