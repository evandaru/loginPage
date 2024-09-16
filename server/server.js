const express = require('express');
const postgres = require('postgres');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const cors = require('cors');

const app = express();
const port = 5001;

// Pengaturan CORS yang lebih spesifik (gunakan domain asal frontend kamu)
app.use(cors({
    origin: 'https://login-page-oke9.vercel.app', // Ganti dengan domain frontend kamu
    methods: ['GET', 'POST', 'OPTIONS'], // Metode yang diizinkan
    allowedHeaders: ['Content-Type', 'Authorization'], // Header yang diizinkan
    credentials: true // Jika menggunakan cookie atau auth header
}));

// Preflight (OPTIONS) route handling untuk semua route yang butuh POST
app.options('/login', cors());
app.options('/signup', cors());

// Koneksi ke database PostgreSQL
const connectionString = "postgresql://postgres.heafwwqjgzyfezrmzqqn:Z5y66U4H76lNwZVC@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres"
const sql = postgres(connectionString);

// Middleware untuk parsing body JSON
app.use(express.json());

// Hash password menggunakan bcrypt
const hashPassword = async (password) => {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
};

// Compare password dengan hashed password dari database
const comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};

// Generate JWT token
const generateToken = (user) => {
    return jwt.sign({ id: user.id, email: user.email }, "sapi", { expiresIn: '1h' });
};

// Route untuk register user baru
app.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const hashedPassword = await hashPassword(password); // Hash password
        const existingUser = await sql`SELECT * FROM users WHERE email = ${email}`;
        if (existingUser.length > 0) {
            return res.status(400).json({ error: 'Email already in use' });
        }
        const result = await sql`INSERT INTO users (name, email, password) VALUES (${name}, ${email}, ${hashedPassword}) RETURNING *`;
        res.status(201).json({ message: 'User registered successfully', user: result[0] });
    } catch (err) {
        console.error('Error signing up:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Route untuk login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const users = await sql`SELECT * FROM users WHERE email = ${email}`;
        if (users.length === 0) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const user = users[0];
        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = generateToken(user);
        res.json({ token });
    } catch (err) {
        console.error('Error logging in:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Endpoint untuk melihat total user (contoh endpoint)
app.get('/users/count', async (req, res) => {
    try {
        const result = await sql`SELECT COUNT(*) FROM users`;
        const totalUsers = result[0].count;
        res.json({ totalUsers });
    } catch (err) {
        console.error('Error fetching user count:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Middleware untuk memverifikasi token JWT
const authenticateJWT = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // Expecting 'Bearer TOKEN'
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    jwt.verify(token, "sapi", (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Forbidden: Invalid Token' });
        }
        req.user = user; // Menambahkan user ke request object
        next();
    });
};

// Contoh protected route yang butuh autentikasi JWT
app.get('/protected', authenticateJWT, (req, res) => {
    res.json({ message: 'This is a protected route', user: req.user });
});

// Jalankan server di port yang ditentukan
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
